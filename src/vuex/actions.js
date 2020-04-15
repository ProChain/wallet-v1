import { hexToString, hexAddPrefix } from '@polkadot/util'
import * as Handles from './constants'
import { formatHexNumber, hexToDid } from '../util/common'
import vm from '../main'

export const actions = {
	[Handles.SET_TOKEN]: async({ commit }, token) => {
		commit(Handles.SET_TOKEN, token)
	},
	[Handles.SET_WALLET_INFO]: async({ commit }, walletInfo) => {
		// set client name
		vm.$socket.emit('setName', {
			name: walletInfo.did,
			address: walletInfo.address
		})
		commit(Handles.SET_WALLET_INFO, walletInfo)
	},
	[Handles.SET_TEAM_INFO]: async({ commit }, teamInfo) => {
		commit(Handles.SET_TEAM_INFO, teamInfo)
	},
	[Handles.SET_AVATAR]: async({ commit }, avatar) => {
		commit(Handles.SET_AVATAR, avatar)
	},
	/**
	 * @@@
	 * all socket relevant state
	 */
	[Handles.SOCKET_CONNECT]: ({ state: { walletInfo } }) => {
		console.log('connect------')
		if (walletInfo.did) {
			vm.$socket.emit('setName', {
				name: walletInfo.did,
				address: walletInfo.address
			})
		}
	},
	[Handles.SOCKET_DISCONNECT]: () => {
		console.log('disconnect------')
	},
	[Handles.SOCKET_RECONNECT]: () => {
		console.log('reconnect------')
	},
	[Handles.SOCKET_BALANCE_CHANGE]: ({ commit, state }, payload) => {
		const walletInfo = {
			...state.walletInfo,
			free_balance: payload.balance
		}
		commit(Handles.SET_WALLET_INFO, walletInfo)
	},
	[Handles.SOCKET_FAILED]: ({ commit }, payload) => {
		vm.$toast(payload.msg)
		commit('hideLoading')
	},
	[Handles.SOCKET_TRANSFERED]: ({ commit }) => {
		commit('hideLoading')
		vm.$toast('已转账')
		setTimeout(() => {
			vm.$router.go(-1)
		}, 500)
	},
	[Handles.SOCKET_LOCKED]: ({ state, commit }, payload) => {
		const [, lockedFunds, lockedTime, lockedPeriod, rewardsRatio, maxQuota] = JSON.parse(payload.msg)
		const lockedRecords = {
			locked_funds: formatHexNumber(lockedFunds),
			locked_time: lockedTime,
			locked_period: lockedPeriod,
			rewards_ratio: rewardsRatio,
			max_quota: formatHexNumber(maxQuota)
		}
		const walletInfo = {
			...state.walletInfo,
			locked_records: lockedRecords
		}
		commit(Handles.SET_WALLET_INFO, walletInfo)
		commit('hideLoading')
		vm.$toast('已抵押')
	},
	[Handles.SOCKET_UNLOCKED]: ({ state: { walletInfo }, commit }, payload) => {
		const [, amount, unlockedTime] = JSON.parse(payload.msg)
		const unlockedRecords = walletInfo.unlocked_records
		const unlockedFunds = formatHexNumber(amount)
		let newUnlockedFunds = (unlockedRecords ? unlockedRecords.unlocked_funds : 0) + unlockedFunds

		// update locked data
		const lockedRecords = walletInfo.locked_records
		const lockedFunds = lockedRecords.locked_funds - unlockedFunds
		let maxQuota = lockedFunds * 10
		let rewardsRatio
		if (maxQuota >= walletInfo.subordinate_count) {
			rewardsRatio = 20
		} else {
			rewardsRatio = 100 * (1 - maxQuota / walletInfo.subordinate_count)
		}

		const newWalletInfo = {
			...walletInfo,
			locked_records: {
				...lockedRecords,
				locked_funds: lockedFunds,
				max_quota: maxQuota,
				rewards_ratio: rewardsRatio
			},
			unlocked_records: {
				unlocked_funds: newUnlockedFunds,
				unlocked_time: unlockedTime
			}
		}
		commit(Handles.SET_WALLET_INFO, newWalletInfo)
		commit('hideLoading')
		vm.$toast('已赎回')
	},
	[Handles.SOCKET_ADDRESS_ADDED]: ({ state: { walletInfo }, commit }, payload) => {
		let [, addressType, address] = JSON.parse(payload.msg)
		const externalAddress = walletInfo.external_address

		addressType = hexToString(addressType)
		address = hexToString(address)
		if (addressType === 'eth') address = hexAddPrefix(address)
		const newWalletInfo = {
			...walletInfo,
			external_address: {
				...externalAddress,
				[addressType]: address
			}
		}
		commit(Handles.SET_WALLET_INFO, newWalletInfo)
		commit('hideLoading')
		vm.$router.push('/')
	},
	[Handles.SOCKET_GROUPNAME_SET]: ({ commit }) => {
		commit('hideLoading')
	},
	[Handles.SOCKET_UPDATED]: ({ state, commit }) => {
		commit('hideLoading')
		commit(Handles.CHANGE_MODE, 'independent')
		localStorage.setItem('mode', 'independent')
		localStorage.setItem('did', state.walletInfo.did)
		vm.$toast('已更新公钥')
	},
	[Handles.SOCKET_SUB_CREATED]: ({ state, commit }) => {
		const subordinateCount = state.walletInfo.subordinate_count + 1
		const walletInfo = {
			...state.walletInfo,
			subordinate_count: subordinateCount
		}
		commit(Handles.SET_WALLET_INFO, walletInfo)
		commit('hideLoading')
	},
	[Handles.SOCKET_CREATED]: ({ state, commit }, { msg }) => {
		if (msg) {
			let [did] = JSON.parse(msg)
			const walletInfo = {
				...state.walletInfo,
				did: hexToDid(did)
			}
			commit(Handles.SET_WALLET_INFO, walletInfo)
			commit('hideLoading')
			setTimeout(() => {
				commit('initDid', true)
			}, 300)
		}
	},
	[Handles.DISPATCH_SIGN]: ({ state, commit }, data) => {
		if (state.walletInfo.free_balance <= 0) {
			return vm.$toast('请确保您持有的PRM大于0')
		}
		const params = Object.assign({}, data, {
			token: state.token
		})
		console.log(params, 'new params------')
		vm.$socket.emit('sign', params)
		commit('showLoading')
	},
};
