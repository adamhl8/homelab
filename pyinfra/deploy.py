from pyinfra.operations import server

server.shell(
    name="Say hello",
    commands=["echo hello from pyinfra"],
)
