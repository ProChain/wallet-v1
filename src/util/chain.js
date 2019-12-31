import axios from './axios';

const baseUrl = 'http://localhost:8091'
const apiMetadata = `${baseUrl}/api/did`
const apiConvertion = `${baseUrl}/api/convertion`

export const DID_TYPE = {
	'1': '个人',
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
