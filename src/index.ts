import { Core, Request, Logger } from "wulfy";
import { Readable } from "stream";
import { IncomingMessage, ServerResponse } from "http";
import { normalize } from "path";

import HttpServer from "./Server/HttpServer";
import HttpsServer from "./Server/HttpsServer";

declare module 'wulfy' {
	interface Request {
		secure?: true;
	}
}

class HttpCore extends Core {
	private server: HttpServer;
	private secServer: HttpsServer;

	protected init() {
		this.requestHandler = this.requestHandler.bind(this);
		this.server = new HttpServer();
		if (HttpsServer.canCreate()) {
			this.secServer = new HttpsServer();
			this.secServer.onRequest((req, res) => this.requestHandler(req, res, true));

			this.server.onRequest((req, res) => {
				if (process.env.SEC_REDIERCT && process.env.SEC_REDIERCT.toLowerCase() === "true") {
					const host = req.headers.host || process.env.HOST;
					if (host) {
						res.statusCode = parseInt(process.env.SEC_REDIERCT_CODE) || 308;

						const getRedirectHost = (host) => {
							host = host.split(":")[0];
							if (process.env.SEC_PORT !== "443") {
								host += ":" + process.env.SEC_PORT;
							}
							return host;
						}

						res.setHeader("Location", "https://" + normalize(getRedirectHost(host) + "/" + req.url));
						res.end();
						return;
					} else {
						Logger.warn("Host not specified, redirect not possible.");
					}
				}
				this.requestHandler(req, res);
			});
		} else {
			this.server.onRequest(this.requestHandler);
		}

	}

	protected async requestHandler(req: IncomingMessage, res: ServerResponse, secure = false) {
		const request: Request = {
			headers: req.headers,
			method: req.method || "get",
			path: req.url || "/",
			body: req.body || ""
		};
		if (secure === true)
			request.secure = true;
		const response = await this.getResponse(request);

		const headers = response.getHeaders();
		for (const header in headers) {
			const value = headers[header];
			if (value)
				res.setHeader(header, value);
		}

		res.statusCode = response.getStatus();
		const content = response.getContent();
		if (content && content instanceof Readable) {
			content.pipe(res);
		} else {
			if (content) res.write(content);
			res.end();
		}
	}

	protected __start() {
		if (!this.server) return;
		this.server.listen();
		if (this.secServer) this.secServer.listen();
	}

	protected __stop() {
		if (!this.server) return;
		this.server.close();
		if (this.secServer) this.secServer.close();
	}
}

export default HttpCore;
