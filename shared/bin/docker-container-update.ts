#!/usr/bin/env bun

import path from "node:path";
import { $, type Shell, type ShellExpression } from "bun";

interface BunShellOptions {
	cwd?: string;
	env?: Record<string, string | undefined>;
	quiet?: boolean;
}

/**
 * This is a wrapper around Bun shell to make it easier to create new instances.
 */
class BunShell {
	#shell: Shell;
	#cwd = "";
	#env: Record<string, string | undefined> = {};
	#quiet = false;

	constructor(options?: BunShellOptions) {
		const { cwd, env, quiet } = options ?? {};

		this.#shell = new $.Shell();
		this.#shell.throws(true);

		this.cwd = cwd ?? process.cwd();
		this.env = env ?? Bun.env;
		this.quiet = quiet ?? false;
	}

	$(strings: TemplateStringsArray, ...expressions: ShellExpression[]) {
		if (this.quiet) return this.#shell(strings, ...expressions).quiet();
		return this.#shell(strings, ...expressions);
	}

	get cwd() {
		return this.#cwd;
	}

	set cwd(path: string) {
		this.#shell.cwd(path);
		this.#cwd = path;
	}

	get env() {
		return this.#env;
	}

	set env(env: Record<string, string | undefined>) {
		this.#shell.env(env);
		this.#env = env;
	}

	get quiet() {
		return this.#quiet;
	}

	set quiet(quiet: boolean) {
		this.#quiet = quiet;
	}
}

interface ContainerDetails {
	imageName: string;
	serviceName: string;
	composeFilePath: string;
	build: boolean;
	isUpToDate: boolean;
}

const shell = new BunShell({ quiet: true });

async function getRunningContainers() {
	const containers = (
		await shell.$`docker ps --format '{{.ID}}::{{.Image}}'`.text()
	)
		.trim()
		.split("\n");
	return containers.map((container) => container.split("::"));
}

async function getContainerDetails(
	containerId: string,
	image: string,
): Promise<ContainerDetails | undefined> {
	try {
		const imageName = (
			await shell.$`docker inspect ${containerId} --format='{{.Config.Image}}'`.text()
		).trim();
		const serviceName = (
			await shell.$`docker inspect ${containerId} --format '{{ index .Config.Labels "com.docker.compose.service" }}'`.text()
		).trim();
		const composeFile = (
			await shell.$`docker inspect ${containerId} --format '{{ index .Config.Labels "com.docker.compose.project.config_files" }}'`.text()
		).trim();
		const composeFilePath = path.resolve(composeFile);
		const composeFileExists = await Bun.file(composeFilePath).exists();
		if (!composeFileExists) {
			throw new Error(`Compose file not found: ${composeFilePath}`);
		}

		const composeConfigJson = (
			await shell.$`docker compose -f ${composeFilePath} config --format json`.text()
		).trim();
		const composeConfig = JSON.parse(composeConfigJson);

		const build = Object.hasOwn(composeConfig.services[serviceName], "build");

		let isUpToDate = false;
		if (!build) {
			const imageId = (
				await shell.$`docker inspect ${containerId} --format '{{.Image}}'`.text()
			).trim();
			const imageDigest = (
				await shell.$`docker image inspect ${imageId} --format '{{.RepoDigests}}'`.text()
			).trim();
			const remoteDigest = (
				await shell.$`regctl image digest ${image}`.text()
			).trim();
			isUpToDate = imageDigest.includes(remoteDigest);
		}

		return { imageName, serviceName, composeFilePath, build, isUpToDate };
	} catch (error) {
		console.error(
			`An error occured while getting the details for container: ${image} (${containerId})`,
		);
		console.error(error);
	}
}

async function buildComposeFilesToContainers(
	runningContainers: string[][],
): Promise<Map<string, ContainerDetails[]>> {
	const composeFilesToContainers: Map<string, ContainerDetails[]> = new Map();
	for (const [containerId, image] of runningContainers) {
		const containerDetails = await getContainerDetails(containerId, image);
		if (!containerDetails) continue;
		const composeFilePath = containerDetails.composeFilePath;
		composeFilesToContainers.set(composeFilePath, [
			...(composeFilesToContainers.get(composeFilePath) || []),
			containerDetails,
		]);
	}
	return composeFilesToContainers;
}

function printContainerUpdateDetails(container: ContainerDetails) {
	let status = "";
	if (container.build) {
		status = "Build";
	} else if (container.isUpToDate) {
		status = "Up to date";
	} else {
		status = "Update found";
	}
	console.log(`${container.serviceName}[${container.imageName}]: ${status}`);
}

async function updateContainer(container: ContainerDetails) {
	const composeFileDir = path.dirname(container.composeFilePath);
	if (container.build) {
		console.log(`Building ${container.serviceName}[${container.imageName}]...`);
		await shell.$`cd ${composeFileDir} && docker compose -f ${container.composeFilePath} build --no-cache --pull ${container.serviceName} && docker compose -f ${container.composeFilePath} up -d ${container.serviceName}`;
	} else if (!container.isUpToDate) {
		console.log(`Updating ${container.serviceName}[${container.imageName}]...`);
		await shell.$`cd ${composeFileDir} && docker pull ${container.imageName} && docker compose -f ${container.composeFilePath} up -d ${container.serviceName}`;
	}
}

async function main() {
	console.log("Getting details for running containers...");
	const runningContainers = await getRunningContainers();
	const composeFilesToContainers =
		await buildComposeFilesToContainers(runningContainers);

	for (const [composeFilePath, containers] of composeFilesToContainers) {
		console.log(`\n== ${composeFilePath} ==`);
		for (const container of containers) {
			printContainerUpdateDetails(container);
		}
		for (const container of containers) {
			await updateContainer(container);
		}
	}
}

await main();
