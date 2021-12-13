import Core from "wulfy";
import { createServer, Server } from "http";

declare module "http" {
	interface IncomingMessage {
		body: string;
	}
}

abstract class HttpCore extends Core {
	private port: number;
	private server: Server;

	protected __init() {
		this.port = this.config.get("port", 80);
		this.server = createServer();
		this.server.on("request", (req, res) => {
			req.body = "";
			req.on("data", c => req.body += c);
			req.on("end", () => {
				this.response(req, res);
			})
		})
	}

	protected async __launch() {
		this.server.listen(this.port || 80);
	}
	protected __shutdown() {
		this.server.close();
	}
}

export default HttpCore;
