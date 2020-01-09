import axios from './axios';

const baseUrl = process.env.VUE_APP_SIGN_HOST
const apiMetadata = `${baseUrl}/api/v1/did`
const apiConvertion = `${baseUrl}/api/v1/convert`
export const DID_TYPE = {
	'2': '交易所',
	'3': '设备',
	'4': '应用',
	'5': '合约',
	'6': '节点'
}

export async function getMetadata(id) {
	return axios.get(`${apiMetadata}/${id}`)
}

export async function convert(identifier, type) {
	return axios.get(apiConvertion, {
		params: {
			identifier,
	  type
		}
	});
}
