import { Server as WebServer, IncomingMessage, ServerResponse } from "http";
import { Logger } from "wulfy";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

abstract class Server {
	private server: WebServer;

	public constructor() {
		this.server = this.createServer();
	}

	public onRequest(callback: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) {
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
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
