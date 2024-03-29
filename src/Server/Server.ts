import { Server as WebServer, IncomingMessage, ServerResponse } from "http";
import { Logger } from "wulfy";

declare module "http" {
	interface IncomingMessage {
		body: Buffer;
	}
}

abstract class Server {
	private server: WebServer;

	public constructor() {
		this.server = this.createServer();
		this.onListen = this.onListen.bind(this);
		this.onClose = this.onClose.bind(this);
	}

	public onRequest(callback: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) {
		this.server.on("request", (req, res) => {
			req.body = Buffer.alloc(0);
			req.on("data", data => {
				if (!Buffer.isBuffer(data)) data = Buffer.from(data);

				req.body = Buffer.concat([req.body, data], req.body.length + data.length);
			});
			req.on("end", async () => {
				await callback(req, res);
				Logger.info(`${req.method} ${req.url} HTTP/${req.httpVersion} ${res.statusCode} ${req.headers['user-agent'] || "-"}`);
			})
		})
	}

	public listen() {
		this.server.listen(this.getPort(), this.onListen)
	}

	public close() {
		this.server.close(this.onClose);
	}


	protected abstract onListen(): void;
	protected abstract onClose(err?: Error): void;
	protected abstract getPort(): number;
	protected abstract createServer(): WebServer;
}

export default Server;
