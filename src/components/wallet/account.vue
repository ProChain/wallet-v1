<template>
	<div class="user-account">
		<div class="reward-con">
			<van-cell-group :border="false">
				<div class="colocation" slot="title">
					<router-link to="/help">{{ mode === 'hosted' ? '托管模式' : '自主模式' }}</router-link>
				</div>
				<van-cell v-if="!did" size="large" :center="true" to="/avatar" title="暂时未识别到您的DID,请点击这里"
				 is-link>
					<i class="icon headimg" :style="{backgroundImage: `url(${headimgurl})`}" slot="icon"></i>
					<div class="label" slot="label">
						我的PRM: {{ metadata.free_balance | money(false) }}
					</div>
				</van-cell>
				<van-cell v-else size="large" :center="true" :title="did | clip(18, -10)">
					<i class="icon headimg" :style="{backgroundImage: `url(${headimgurl})`}" slot="icon"></i>
					<div class="label" slot="label">
						我的PRM: {{ metadata.free_balance | money(false) }}
					</div>
				</van-cell>
			</van-cell-group>
			<!-- <h2>
				我的资产
				<van-button size="small" type="default" class="colocation" to="/help">{{ mode === 'hosted' ? '托管模式' : '自主模式'}}</van-button>
				<div>{{ metadata.free_balance | money }}</div>
			</h2> -->
			<div class="handle-btns">
				<van-button icon="exchange" square type="default" class="btn-text" :to="mode === 'hosted' ? '/transfer' : ''"
				 :class="{'disabled': mode !== 'hosted'}">转账</van-button>
				<van-button icon="down" square type="default" class="copy btn-text" :data-clipboard-text="metadata.did">收款</van-button>
			</div>
		</div>
		<van-popup v-model="showHelp" :style="{ width: '80%' }" :closeable="true">
			<div class="help">
				<h3>托管模式</h3>
				<p>
					托管模式下的般若DID账号的公私钥将被中心化托管，由中心化服务商提供代理服务。主要用于账户初始化和小额转账。当DID账号内资产大于100RMB时，托管服务将被终止，您将需要激活自主模式。
				</p>
				<h3>自主模式</h3>
				<p>
					由用户自主管理公私钥，网页端只能用于账户获取收益，无法进行账户转账、签名等功能。相关功能需要在去中心化钱包中进行操作。
				</p>
			</div>
		</van-popup>
	</div>
</template>
<script>
	import { decodeAvatar } from '@/util/api'
	export default {
		name: 'account',
		props: ['metadata', 'headimgurl', 'mode'],
		data() {
			return {
				menuName: '托管模式',
				showHelp: false,
				did: '',
				updated: false
			}
		},
		async updated() {
			try {
				if (!this.updated) {
					if (!this.headimgurl) return
					const { data: { result } } = await decodeAvatar(this.headimgurl)
					this.did = result

					if (result && result.length === 6) {
						this.did = await convert(result, 'index')
					}
					this.updated = true
				}
			} catch (e) {
				alert(e)
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.user-account {
		.van-cell-group__title {
			a {
				color: $lightGrey;
			}
		}

		.van-cell-group {
			background-color: transparent;

			* {
				color: #fff !important;
			}

			.van-cell {
				background-color: transparent;
				padding-top: 0;

				.van-cell__title {
					span {
						color: rgba(255, 255, 255, 0.9) !important;
						font-size: 14PX;
					}
				}

				.headimg {
					width: 50px;
					height: 50px;
					background-size: 100%;
					margin-right: $mediumGutter;
					border-radius: 5px;
				}

				.label {
					font-size: 17PX;
					font-weight: bold;
				}
			}
		}

		.reward-con {
			padding: 15px;
			color: #fff;
			background-image: url(../../assets/images/reward_bg.svg);
			background-size: cover;
			background-position: center;
			position: relative;

			h2 {
				margin-top: 10px;
				font-size: $largeFontSize;
				font-weight: normal;

				div {
					font-size: 1.5 * $largeFontSize;
					margin-top: 10px;
				}
			}

			.colocation {
				display: flex;
				align-items: center;
				line-height: normal;
				a {
					background: rgba(27, 0, 0, 0.3);
					padding: 2px 5px;
					border-radius: 2px;
				}
			}

			.handle-btns {
				text-align: center;

				.disabled {
					color: #eee;
				}

				button {
					width: 50%;
					color: #fff;
					font-size: $largeFontSize;

					&:first-of-type {
						&::after {
							content: '';
							float: right;
							height: 20px;
							border-right: 1PX dashed #fff;
							margin-top: 12px;
						}
					}
				}
			}
		}

		.help {
			padding: 15px;
			font-size: $mediumFontSize;

			p {
				color: $grey;
			}

			h3 {
				margin: 15px 0 5px;
			}
		}
	}
</style>
