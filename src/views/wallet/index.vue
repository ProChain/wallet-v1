<template>
	<div class="home-page">
		<div class="wallet">
			<account :metadata="walletInfo" :headimgurl="headimgurl" :mode="mode" />
			<van-notice-bar text="快快加入你的推荐人社群，获取更多收益信息!" left-icon="volume-o" @click="$router.push('/team/qrcode')" />
			<div class="lock-btns" ref="locks">
				<van-grid :border="false" :column-num="3">
					<van-grid-item icon="manager-o" text="DID" to="/profile" />
					<!-- <van-grid-item icon="friends-o" text="团队" :to="mode === 'hosted' ? '/team' : ''" :class="{'disabled': mode !== 'hosted'}" /> -->
					<van-grid-item icon="friends-o" text="团队" to="/team" />
					<van-grid-item icon="balance-o" text="挖矿(测试)" to="/activity/mint" />
					<!-- <van-grid-item icon="replay" text="更新" :to="mode === 'hosted' ? '/update-pubkey' : ''" :class="{'disabled': mode !== 'hosted'}" /> -->
				</van-grid>
			</div>
			<van-skeleton title avatar :row="2" :loading="!walletInfo.did">
				<transaction :metadata="walletInfo"></transaction>
			</van-skeleton>
		</div>
		<van-overlay :show="showBindingTutorial" class="van-tutorial">
			<div class="wrapper">
				<div class="binding-tutorial">
					<div class="text">
						您尚未绑定微信账号，<b>请将以下验证码发送到群中，然后重新打开该页面</b>，验证码不再显示即绑定成功
					</div>
					<div class="content-box">
						<div class="dialog">
							{{ bindSn }}
						</div>
						<img src="@/assets/images/logo.jpg" />
					</div>
					<div class="code-con">
						<img src="@/assets/images/bind-did2.jpg" alt="binding">
						<!--<div class="code-num">
							{{ bindSn }}
						</div>-->
					</div>
					<van-button type="primary" size="large" class="bind-code copy" :data-clipboard-text="bindSn">
						复制激活码<b>{{ bindSn }}</b>
					</van-button>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="showInvitation" class="van-invitation">
			<div class="wrapper">
				<div class="content">
					<h5>
						<van-icon name="warning-o" />请输入邀请码完成DID创建</h5>
					<van-field v-model="shortIndex" placeholder="请输入你的邀请码" />
					<van-button v-if="shortIndex && /\w{6}/.test(shortIndex)" type="primary" size="large" square class="create-did"
					 @click="createDid(shortIndex)">
						生成我的DID</b>
					</van-button>
					<van-button v-else type="primary" size="large" square disabled class="create-did">
						生成我的DID</b>
					</van-button>
				</div>
			</div>
		</van-overlay>
		<van-overlay :show="isNewbie && isInit && !showBindingTutorial" class="van-newbie">
			<div v-if="pos.top" class="wrapper" :style="{marginTop: pos.top + 'px'}">
				<van-grid :border="false" :column-num="1">
					<van-grid-item icon="manager-o" text="DID" to="/profile" />
				</van-grid>
				<van-icon name="share" />
				<div class="tip">
					创建您的区块链身份头像，方便微信里领取各种广告奖励
				</div>
			</div>
			<van-button type="default" @click="handleDelay">下次创建</van-button>
		</van-overlay>
		<van-overlay :show="!isInit" class="init">
			<div class="wrapper">
				<div>
					<van-loading size="24px" color="#fff" vertical>正在为您创建DID，请稍等片刻...</van-loading>
				</div>
			</div>
		</van-overlay>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { getWechatUser } from '@/util/api'
	import { sleep, getRect } from '@/util/common'
	import ClipboardJS from 'clipboard'
	import { convert, getMetadata } from '@/util/chain'
	import { SET_WALLET_INFO, SET_USER_INFO, SET_TOKEN, CHANGE_MODE } from '@/vuex/constants'
	import Account from '@/components/wallet/account'
	import Transaction from '@/components/wallet/transaction'
	export default {
		name: 'walletHome',
		data() {
			return {
				code: '',
				showBindingTutorial: false,
				showInvitation: false,
				bindSn: '',
				shortIndex: '',
				unionid: '',
				headimgurl: '',
				pos: {}
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'isNewbie',
				'isInit',
				'mode'
			])
		},
		watch: {
			isInit(val) {
				if (val && val !== 'reset') {
					console.log(val, 'is init')
					this.showInvitation = false
					this.getUserData(this.walletInfo.did)
				}
			}
		},
		components: {
			Account,
			Transaction
		},
		async mounted() {
			this.clipboard = new ClipboardJS('.copy', {
				text(e) {
					return e.getAttribute('data-clipboard-text')
				}
			})
			this.clipboard.on('success', (e) => {
				if (e.action === 'copy') {
					this.$toast('复制成功')
				}
				e.clearSelection()
			})
			this.clipboard.on('error', function(e) {
				console.error('Action:', e.action)
			})
			setTimeout(() => {
				this.pos = getRect(this.$refs.locks)
				console.log(this.pos)
			}, 700)

			try {
				await sleep()
				await this.init()
			} catch (e) {
				alert(e)
			}
		},
		methods: {
			async init() {
				const url = window.location.href
				const part1 = url.split('&state')[0]
				const code = part1.split('code=')[1]

				// set mode
				const mode = localStorage.getItem('mode')
				if (mode === 'independent') {
					this.$store.commit(CHANGE_MODE, 'independent')
					const did = localStorage.getItem('did')
					await this.getUserData(did)
					return
				}

				// check code
				// const { data: snData } = await chainBindSn(code)
				// if (snData && snData.result) {
				// 	this.showBindingTutorial = true
				// 	this.bindSn = snData.result
				// 	return
				// }

				// check user info
				const { data } = await getWechatUser(code)
				if (!data) return
				data.headimgurl = data.headimgurl.replace(/\d+$/, 0)
				this.headimgurl = data.headimgurl
				this[SET_USER_INFO](data)
				if (data.wxid) {
					this[SET_TOKEN](data.token)
					const { result: didHash } = await convert(data.wxid, 'unionid')
					if (didHash) {
						await this.getUserData(didHash)
						return
					}
				}
				if (data.unionid) {
					const { result: unionHash } = await convert(data.unionid, 'unionid')
					this.unionid = data.unionid
					if (unionHash) {
						await this.getUserData(unionHash)
					} else {
						const { short_index: shortIndex } = this.$route.query
						if (shortIndex) {
							this.createDid(shortIndex)
						} else {
							this.showInvitation = true
						}
					}
				}
			},
			async getUserData(didHash) {
				const { data: metadata } = await getMetadata(didHash)
				this[SET_WALLET_INFO](metadata)

				// user guide
				const isNew = localStorage.getItem('isNew')
				if (isNew !== 'false') {
					this.$store.commit('setNewbie', true)
				} else {
					this.$store.commit('setNewbie', false)
				}
			},
			createDid(shortIndex) {
				this.$store.commit('initDid', false)
				const params = {
					type: '1',
					unionid: this.unionid,
					shortIndex
				}

				this.$socket.emit('create_by_sns', params)
				this.sockets.subscribe('tx_failed', payload => {
					console.log(payload, 'create failed')
					this.$store.commit('initDid', 'reset')
					// this.$dialog.confirm({
					// 	title: '温馨提示',
					// 	message: '创建DID失败，是否重新绑定？',
					// 	messageAlign: 'left'
					// }).then(() => {
					// 	removeBind(data.token).then(() => {
					// 		window.location.reload()
					// 	})
					// }).catch(console.error)
				})
			},
			handleDelay() {
				this.$store.commit('setNewbie', false)
			},
			...mapActions([
				SET_WALLET_INFO,
				SET_USER_INFO,
				SET_TOKEN
			])
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.wallet {
		height: 100% !important;

		.van-skeleton {
			margin-top: $mediumGutter;
		}

		.lock-btns {
			text-align: center;
		}

		.external-account {
			margin-bottom: 20px;
		}

		.account {
			.title {
				position: relative;

				.create {
					position: absolute;
					top: -10px;
					right: 0;
					z-index: 999;
					font-size: $mediumFontSize;
				}
			}
		}
	}

	.van-tutorial {
		z-index: 999;
	}

	.binding-tutorial {
		background: #fff;
		width: 80%;
		padding: $largeGutter;
		font-size: $mediumFontSize;
		border-radius: $smallGutter;

		.text b {
			color: $red;
		}

		.code-con {
			position: relative;

			img {
				width: 100%;
				margin: 0 0 10px;
			}

			.code-num {
				position: absolute;
				top: 19px;
				right: 68px;
			}
		}

		.bind-code {
			b {
				margin-left: 5px;
			}
		}
	}

	.content-box {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		background: #ededed;
		padding: 10px;
		margin: $mediumGutter 0 0;
		overflow: hidden;

		.dialog {
			height: 35px;
			line-height: 35px;
			padding: 0 20px 0 10px;
			background: #9fe971;
			position: relative;
			margin-right: 15px;
			border-radius: 5px;

			&::after {
				content: '';
				position: absolute;
				right: -6px;
				top: 12px;
				width: 0;
				height: 0;
				border-top: 4px solid transparent;
				border-bottom: 4px solid transparent;
				border-left: 6px solid #9fe971;
			}
		}

		img {
			width: 40px;
			height: 40px;
		}
	}

	.home-page {
		.van-newbie {
			.wrapper {
				align-items: flex-start;
				justify-content: flex-start;

				.van-grid {
					flex: 0 0 33.3333%;

					.van-grid-item {
						height: 82PX;

						.van-grid-item__content--center {
							width: 70PX;
							height: 70PX;
							border-radius: 100%;
							margin: 6PX auto 0;
						}
					}
				}

				.van-icon-share {
					color: #fff;
					transform: rotateY(180deg);
					margin-top: $largeGutter;
				}

				.tip {
					color: #fff;
					font-size: $mediumFontSize;
					padding: $largeGutter;
					margin-top: $mediumGutter;
				}
			}

			.van-button--normal {
				position: absolute;
				right: $largeGutter;
				bottom: $largeGutter;
			}
		}

		.van-invitation {
			.content {
				width: 80%;
				background: #fff;
				font-size: $mediumFontSize;

				h5 {
					font-weight: normal;
					padding: $mediumGutter;
					border-bottom: 1px solid #eee;

					.van-icon {
						font-size: $largeFontSize;
						vertical-align: middle;
						margin-right: $smallGutter;
					}
				}

				.create-did {
					margin-top: $largeGutter;
				}
			}
		}

		.van-grid-item {
			&.disabled {
				color: $grey;
			}
		}

		.init {
			.van-loading__text {
				color: #fff;
			}
		}
	}
</style>
