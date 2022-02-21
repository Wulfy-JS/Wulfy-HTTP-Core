import { createServer } from "http";
import { Logger } from "wulfy";

import Server from "./Server";
import getNetworkAddress from "../getNetworkAddress";

class HttpServer extends Server {
	protected createServer() {
		return createServer();
	}

	protected getPort(): number {
		return parseInt(process.env.PORT) || 80;
	};

	protected onListen(): void {
		const port = this.getPort();
		Logger.info(`HTTP-Server launch in port ${port}`);
		const ip = getNetworkAddress();

		Logger.info(`Local - http://${process.env.HOST || "localhost"}:${port}`);
		if (ip !== false)
			Logger.info(`Local - http://${ip}:${port}`);
	}

	protected onClose(e?: Error): void {
		e ? Logger.error(e) : Logger.info(`HTTP-Server stoped`);
	}
}

export default HttpServer;
