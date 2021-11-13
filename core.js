import Core from "red-project";
import { createServer } from "http";

class HttpCore extends Core {
	__init() {
		this.server = createServer();
		this.server.on("request", (req, res) => {
			this.response(req, res);
		})
	}

	async __launch() {
		this.server.listen(80);
	}
	shutdown() {
		this.server.close();
	}
}

export default HttpCore;
