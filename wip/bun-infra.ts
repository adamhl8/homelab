// type JsonPrimitive = string | number | boolean | null;
// type JsonArray = JsonValue[];
// type JsonObject = { [key: string]: JsonValue };

// type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface HostContext {
	host: string;
	user: string;
	arch: string;
	os: string;
}

// added and modified handlers should always handle the case where there is no state
// that is, it should handle any potential errors that may occur when the value already exists
// e.g. say brew throws an error if the package is already installed, we would check if it's installed first in the added handler
// idempotent
const packages = {
	added: (ctx: HostContext, packages: string[]) => {
		const os = ctx.os;
		if (os === "debian") {
			return packages.map((pkg) => `apt install -y ${pkg}`);
		}
		if (os === "darwin") {
			return packages.map((pkg) => {
				if (`brew ls ${pkg}`) return;
				return `brew install ${pkg}`;
			});
		}
	},
	deleted: (ctx: HostContext, packages: string[]) => {
		const os = ctx.os;
		if (os === "debian") {
			return packages.map((pkg) => `apt remove -y ${pkg}`);
		}
		if (os === "darwin") {
			return packages.map((pkg) => `brew remove -y ${pkg}`);
		}
	},
	modified: (ctx: HostContext, packages: string[]) => {
		return;
	},
};

const config = {
	sid: {
		host: "sid.lan",
		user: "adam",
		port: 22,
		operators: {
			packages: {
				value: ["curl", "git"],
				handler: packages,
			},
		},
	},
};

function run() {
	const hosts = process.argv.slice(2);

	for (const host of hosts) {
		const context = {
			host: config[host].host,
			user: config[host].user,
			arch: process.arch,
			os: process.platform,
		};

		for (const [operatorName, operator] of Object.entries(
			config[host].operators,
		)) {
			const state = getState(`./state/${host}/${operatorName}.json`);
			const diff = getStateDiff(state, operator.value);
			// returns something like: { added: ["git"], deleted: [], modified: [] }

			if (diff.added.length > 0) {
				operator.handler.added(context, diff.added);
			}
			if (diff.deleted.length > 0) {
				operator.handler.deleted(context, diff.deleted);
			}
			if (diff.modified.length > 0) {
				operator.handler.modified(context, diff.modified);
			}
		}
	}
}

function getState(path: string) {
	const state = JSON.parse(fs.readFileSync(path, "utf-8"));
	if (!state) {
		return;
	}
	return state;
}
