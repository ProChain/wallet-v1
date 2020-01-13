<template>
	<div class="help-component">
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
	</div>
</template>
<script>
	export default {
		name: 'help'
	}
</script>
<style lang="scss" scoped>
	@import '../assets/css/variables.scss';

	.help-component {
		font-size: $mediumFontSize;

		.help {
			padding: 15px;

			p {
				color: $grey;
				margin-bottom: 20px;
			}

			h3 {
				margin: 0 0 5px;
			}
		}
	}
</style>
