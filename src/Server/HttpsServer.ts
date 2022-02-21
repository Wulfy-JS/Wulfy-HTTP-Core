import { createServer } from "https";
import { Core, Logger } from "wulfy";
import { readFileSync as readFile, existsSync as exists, statSync as stat } from "fs";

import getNetworkAddress from "../getNetworkAddress";
import Server from "./Server";

class HttpsServer extends Server {
	protected createServer() {
		if (!process.env.SEC_KEY) throw new ReferenceError("SEC_KEY not set");
		if (!process.env.SEC_CERT) throw new ReferenceError("SEC_CERT not set");

		const key_path = `${Core.rootPath}/${process.env.SEC_KEY}`;
		if (!exists(key_path) || !(stat(key_path).isFile()))
			throw new ReferenceError(`File ${key_path} not found!`);
		const cert_path = `${Core.rootPath}/${process.env.SEC_CERT}`;
		if (!exists(cert_path) || !(stat(cert_path).isFile()))
			throw new ReferenceError(`File ${cert_path} not found!`);

		const key = readFile(key_path);
		const cert = readFile(cert_path);

		return createServer({ key, cert });
	}

	protected getPort(): number {
		return parseInt(process.env.SEC_PORT) || 443;
	};

	protected onListen(): void {
		const port = this.getPort();
		Logger.info(`HTTPS-Server launch in port ${port}`);
		const ip = getNetworkAddress();

		Logger.info(`Local - https://${process.env.HOST || "localhost"}:${port}`);
		if (ip !== false)
			Logger.info(`Local - https://${ip}:${port}`);
	}

	protected onClose(e?: Error): void {
		e ? Logger.error(e) : Logger.info(`HTTPS-Server stoped`);
	}

	public static canCreate(): boolean {
		if (!process.env.SEC_KEY || !process.env.SEC_CERT) return false;

		const key_path = `${Core.rootPath}/${process.env.SEC_KEY}`;
		const cert_path = `${Core.rootPath}/${process.env.SEC_CERT}`;

		return exists(key_path) && stat(key_path).isFile() && exists(cert_path) && stat(cert_path).isFile();
	}
}

export default HttpsServer;
