<template>
	<div class="home-page">
		<div class="wallet">
			<account :metadata="walletInfo" />
			<div class="lock-btns">
				<van-grid :border="false" :column-num="3">
					<van-grid-item icon="manager-o" text="DID" to="/profile"/>
					<van-grid-item icon="balance-o" text="挖矿" to="/team" />
					<van-grid-item icon="replay" text="更新" to="/update-pubkey" />
				</van-grid>
			</div>
			<transaction :metadata="walletInfo" v-if="walletInfo.did"></transaction>
		</div>
		<van-overlay :show="showBindingTutorial">
			<div class="wrapper">
				<div class="binding-tutorial">
					<div class="text">
						您尚未激活您的PRA账号，请按照下图，在链接所群中发送激活码完成账号激活
					</div>
					<div class="code-con">
						<img src="@/assets/images/bind-did.jpg" alt="binding">
						<div class="code-num">
							{{ bindSn }}
						</div>
					</div>
					<van-button type="primary" size="large" class="bind-code copy tiny-height" :data-clipboard-text="bindSn">
						复制激活码<b>{{ bindSn }}</b>
					</van-button>
				</div>
			</div>
		</van-overlay>
	</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { chainBindSn, chainAuth } from '@/util/api'
import { sleep } from '@/util/common'
import ClipboardJS from 'clipboard'
import { convert, getMetadata } from '@/util/chain'
import { SET_WALLET_INFO, SET_AVATAR, SET_TOKEN } from '@/vuex/constants'
import Account from '@/components/wallet/account'
import Transaction from '@/components/wallet/transaction'
export default {
	name: 'walletHome',
	data() {
		return {
			code: '',
			showBindingTutorial: false,
			bindSn: ''
		}
	},
	computed: {
		...mapState([
			'walletInfo'
		])
	},
	components: {
		Account,
		Transaction
	},
	async mounted() {
		try {
			this.clipboard = new ClipboardJS('.copy', {
				text(e) {
					return e.getAttribute('data-clipboard-text')
				}
			});
			this.clipboard.on('success', (e) => {
				if (e.action === 'copy') {
					this.$toast('复制成功')
				}
				e.clearSelection()
			});
			this.clipboard.on('error', function(e) {
				console.error('Action:', e.action)
			})
			await sleep(300)
			await this.getUserMetadata()
		} catch (e) {
			console.log(e)
		}
	},
	methods: {
		async getUserMetadata() {
			const url = window.location.href
			const part1 = url.split('&state')[0]
			const code = part1.split('code=')[1]
			const { data } = await chainAuth(code)
			if (data) {
				this[SET_AVATAR](data.avatar)
				const { result: didHash } = await convert(data.wxid, 'wxid')
				if (didHash) {
					const { data: metadata } = await getMetadata(didHash)
					this[SET_WALLET_INFO](metadata)
					this[SET_TOKEN](data.token)
				}
			}
			const { data: snData } = await chainBindSn(code)
			if (snData && snData.result) {
				this.showBindingTutorial = true
				this.bindSn = snData.result
			}
		},
		...mapActions([
			SET_WALLET_INFO,
			SET_AVATAR,
			SET_TOKEN
		])
	}
}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.wallet {
		height: 100% !important;

		.lock-btns {
			text-align: center;
		}

		.van-cell-group {
			.van-cell {}

			.icon {
				width: 38px;
				height: 38px;
				background-repeat: no-repeat;
				background-position: center;
				background-size: 90%;
				margin-right: 10px;

				&.wechat {
					background-image: url(../../assets/images/wechat.svg);
				}

				&.twitter {
					background-image: url(../../assets/images/twitter.svg);
				}

				&.pra {
					background-image: url(../../assets/images/logo.jpg);
				}

				&.eos {
					background-image: url(../../assets/images/eos.svg);
				}

				&.eth {
					background-image: url(../../assets/images/eth.svg);
				}

				&.btc {
					background-image: url(../../assets/images/btc.png);
				}
			}
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

	.binding-tutorial {
		background: #fff;
		width: 80%;
		padding: 10px;
		font-size: $baseFontSize;

		.code-con {
			position: relative;

			img {
				width: 100%;
				margin: 10px 0;
			}

			.code-num {
				position: absolute;
				top: 19px;
				right: 70px;
			}
		}

		.bind-code {
			font-size: $mediumFontSize;

			b {
				margin-left: 5px;
			}
		}
	}
</style>
