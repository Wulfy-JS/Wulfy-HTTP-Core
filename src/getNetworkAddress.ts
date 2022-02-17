import { networkInterfaces } from "os";

const getNetworkAddress = () => {
	const interfaces = networkInterfaces();
	if (interfaces === undefined) return false;

	for (const name of Object.keys(interfaces)) {
		const _interface = interfaces[name];
		if (_interface == undefined) continue;
		for (const _adress of _interface) {
			const { address, family, internal } = _adress;
			if (family === 'IPv4' && !internal) {
				return address;
			}
		}
	}
	return false;
};

export default getNetworkAddress;
