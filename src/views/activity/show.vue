<template>
	<div class="decode-component">
		<div class="decode-card">
			<div class="ads" v-if="ads.display_page">
				<van-image width="100%" height="100%" fit="cover" :src="ads.display_page" @click="distribute(ads.adsId)" />
				<p class="desc">{{ ads.advertiser }}</p>
			</div>
			<p class="no-contetn" v-else>
				<van-loading v-if="showLoading" size="24px">加载中...</van-loading>
				<span v-else>暂时没有广告了</span>
			</p>
		</div>
		<van-notice-bar v-if="showTip" color="#eee" mode="closeable" wrapable background="#333" @close="close">
			请根据自己的兴趣决定是否点击广告，点击该广告意味着对该广告感兴趣，这将影响后续观看此类型广告的收益
		</van-notice-bar>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getWechatUser, adsMining, distribute } from '@/util/api'
	import { convert } from '@/util/chain'
	import decodeAvatarLocal from '@/util/decode'
	import moment from 'moment'
	export default {
		name: 'walletDecode',
		data() {
			return {
				decode: '',
				userInfo: {},
				did: '',
				ads: {},
				showLoading: true,
				showTip: false
			};
		},
		computed: {
			...mapState([
				'walletInfo',
				'token'
			])
		},
		async mounted() {
			const url = window.location.href
			const part1 = url.split('&state')[0]
			const code = part1.split('code=')[1]
			try {
				const { data: userInfo } = await getWechatUser(code)
				userInfo.headimgurl = userInfo.headimgurl.replace(/\d+$/, 0).replace('http', 'https')
				this.userInfo = userInfo
				await this.decodePic()
			} catch (e) {
				alert(e)
				this.$store.commit('hideLoading')
			}

			const isAccept = localStorage.getItem('isAccept')
			this.showTip = isAccept !== '1'
			this.sockets.subscribe('new-ads', async payload => {
				this.ads = payload
				this.showLoading = !payload.advertiser
				if (payload.advertiser) {
					try {
						const keyToday = moment().format('l')
						const record = {}
						const hour = moment().hours()
						if (hour >=0 && hour < 8) {
							record['0-8'] = 1
						} else if (hour >=8 && hour < 13) {
							record['8-13'] = 1
						} else if (hour >=13 && hour < 20) {
							record['13-20'] = 1
						} else {
							record['20-24'] = 1
						}
						localStorage.setItem(keyToday, JSON.stringify(record))
						const rs = await adsMining(this.walletInfo.did, this.token)
						if (rs.hasErrors) return this.$toast(rs.message)
						this.$toast.success('恭喜您算力 +1')
					} catch (e) {
						alert(e)
					}
				}
			})
		},
		methods: {
			async decodePic() {
				this.$store.commit('showLoading')
				this.did = await decodeAvatarLocal(this.userInfo.headimgurl)
				this.$store.commit('hideLoading')
				// this.$socket.emit('query-ads', { did: this.did })
				// request ads
				let records = localStorage.getItem(moment().format('l'))
				if (records) {
					records = JSON.parse(records)
					const hour = moment().hours()
					const dKey = Object.keys(records).find(v => {
						const [start, end] = v.split('-')
						return hour >= start  && hour < end
					})
					if (records[dKey] < 1) {
						this.$socket.emit('query-ads', { did: this.did })
					} else {
						this.$socket.emit('query-ads', { did: this.did, type: 'old' })
					}
				} else {
					const prevKey = moment().subtract(1, 'days').format('l')
					localStorage.removeItem(prevKey)
					this.$socket.emit('query-ads', { did: this.did })
				}
				if (!this.did) {
					return this.$notify({ type: 'danger', message: 'DID解析失败，您将无法收到奖励', duration: 0 })
				}
				if (this.did.length === 6) {
					this.did = await convert(this.did, 'index')
				}
			},
			distribute(adsId) {
				distribute(adsId, this.walletInfo.did, this.token)
			},
			close() {
				localStorage.setItem('isAccept', '1')
			}
		},
		deactivated() {
			this.$notify.clear()
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.decode-component {
		position: relative;

		.van-notice-bar {
			position: fixed;
			left: 0;
			bottom: 0;
			z-index: 999;
		}
	}

	.decode-card {
		height: 100%;
		font-size: $baseFontSize;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;

		// padding: 0 $largeGutter;
		.ads {
			margin-bottom: 70px;
		}

		.van-image {
			margin: $mediumGutter 0;
		}

		.desc {
			color: $grey;
		}

		.disfavor {
			margin-top: $largeGutter;
		}
	}
</style>
