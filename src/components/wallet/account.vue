<template>
	<div class="user-account">
		<div class="reward-con">
			<h2>
				我的余额
				<van-button size="small" type="default" class="colocation" to="/help">托管模式</van-button>
				<div>{{ metadata.free_balance | money }}</div>
			</h2>
			<div class="handle-btns">
				<van-button icon="exchange" square type="default" class="btn-text" to="/transfer">转账</van-button>
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
	export default {
		name: 'account',
		props: ['metadata'],
		data() {
			return {
				menuName: '托管模式',
				showHelp: false
			};
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.user-account {
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
				float: right;
				color: #fff;
				font-size: $mediumFontSize;
				background: rgba(27, 0, 0, 0.3);
				border-radius: 2px;
				height: 22px;
				border: none;

				span {
					display: flex;
					justify-content: center;
					align-items: center;
					line-height: normal;
				}
			}

			.handle-btns {
				margin-top: 20px;
				text-align: center;

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
