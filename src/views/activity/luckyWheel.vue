<template>
<div class="tips">
  <div class="qr-code">
    <img src="@/assets/images/activity/xcx.jpg" alt="xcx">
    <p>抽奖页面已迁移至小程序,请扫码进入小程序抽奖</p>
  </div>
</div>
</template>
<script>
	export default {
		name: 'luckyWheel',
		data() {
			return {
			}
		}
	}
</script>
<style lang="scss" scoped>
	@import '../../assets/css/variables.scss';
  .tips {
    background: #fff;
    padding-top: 50px;
    font-size: $mediumFontSize;
    .qr-code {
      width: 80%;
      margin: 0 auto;
      overflow: hidden;
      img {
        width: 100%;
        margin-top: -5px;
        margin-bottom: 20px;
      }
      p {
        color: $grey;
        text-align: center;
      }
    }
  }
</style>
