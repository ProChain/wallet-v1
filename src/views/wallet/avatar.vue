<template>
<div class="avatar-component">
  <div class="avatar-card">
	<p class="tips">
	  区块链头像中包含了您的DID信息，通过PRA:DID协议的服务，您可获得广告营销激励。此外通过DID，可以查找到对应绑定的btc、eth等地址，实现一个地址，收所有币。
	</p>
	<van-steps
	  :active="current"
	  active-icon="success"
	  active-color="#38f"
	>
	  <van-step>选择头像</van-step>
	  <van-step>选择背景</van-step>
	  <van-step>选择LOGO</van-step>
	</van-steps>
	<!-- <h2>当前头像</h2> -->
	<div class="update-avatar">
	  <img v-if="avatar" class="avatar" :src="avatar"/>
	  <van-icon v-else class="avatar-icon" name="user-circle-o" />
	  <van-uploader
	  class="upload"
	  :before-read="beforeUpload"
	  :preview-image="false"
	  :after-read="handleSuccess" />
	  <p>点击左图手动选择新图生成您的区块链头像</p>
	</div>
	<div v-if="result.avatar" class="choose-color">
	  <h2>选择背景色</h2>
	  <ul class="bgcolor">
		<li v-for="(color, i) in bgcolor" :key="i" :class="{ 'active': colorActive == i}" @click="handleColorChange(color, i)">
		  <span :style="{background: color.replace('0x', '#')}"></span>
		</li>
	  </ul>
	</div>
	<div v-if="result.color" class="choose-logo">
	  <h2>选择LOGO</h2>
	  <ul class="logo">
		<li v-for="(logo, i) in logos" :key="i" :class="{ 'active': logoActive == i}" @click="handleLogoChange(logo, i)">
		  <span>{{ logo.symbol }}</span>
		</li>
	  </ul>
	</div>
	<div class="new-avatar" v-if="result.logo">
	  <img :src="newAvatar"/>
	  <p class="no-content avatar-tip">
		满意吗？可以长按图片保存到本地，手动更换您的微信头像
	  </p>
	</div>
  </div>
</div>
</template>
<script>
import { mapState } from 'vuex'
import { getAvatarStyle, encodeAvatar, getTeamLogo, getTeamInfo, uploadImg } from '@/util/api'
import { sleep } from '@/util/common'
export default {
	name: 'walletAvatar',
	data() {
		return {
			avatar: '',
			bgcolor: [],
			imgArr: [],
			logos: [],
			teamInfo: {},
			newAvatar: '',
			result: {},
			logoActive: null,
			colorActive: null,
			file: null,
			current: -1
		};
	},
	computed: {
		...mapState([
			'walletInfo'
		])
	},
	watch: {
		result: {
			handler(val) {
				if (val.color && val.logo && val.avatar) this.handleCreateAvatar(val.color, val.logo.name, val.avatar)
			},
			deep: true
		},
		avatar(newVal, oldVal) {
			if (newVal && oldVal !== newVal) {
				this.handleAvatarChange(newVal)
			}
		}
	},
	mounted() {
		this.$nextTick(async() => {
			this.avatar = this.$route.query.avatar
			await sleep(300)
			const rs = await getTeamInfo(this.walletInfo.did)
			this.teamInfo = rs.data || {}

			const { data: { list }} = await getTeamLogo(this.walletInfo.did)
			this.logos = list
		});
	},
	methods: {
		async handleCreateAvatar(color, logo, avatar) {
			try {
				const data = await encodeAvatar(avatar, color, this.walletInfo.did, logo)
				this.newAvatar = 'data:image/png;base64,' + btoa(new Uint8Array(data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
			} catch (error) {
				console.log(error)
			}
		},
		async handleAvatarChange(avatar) {
			const { data: list } = await getAvatarStyle(avatar)
			this.bgcolor = list.list
			this.$set(this.result, 'avatar', avatar)
			console.log(this.bgcolor)
			this.current = 0
		},
		handleColorChange(color, i) {
			this.$set(this.result, 'color', color)
			this.colorActive = i
			this.current = 1
		},
		handleLogoChange(logo, i) {
			this.$set(this.result, 'logo', logo)
			this.logoActive = i
			this.current = 2
		},
		beforeUpload(file) {
			console.log(file)
			const maxFileSize = 1024 * 1024 * 10;
			if (!/\.(gif|jpg|jpeg|png|GIF|JPG|JPEG|PNG)$/.test(file.name)) {
				this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种')
				return false
			}
			if (file.size > maxFileSize) {
				this.$toast('图片尺寸超过10M了')
				return false;
			}
			return true
		},
		async handleSuccess(res) {
			const data = new FormData()
			data.append('file', res.file)
			const rs = await uploadImg(data)
			this.avatar = `https://static.chain.pro/${rs.data}`
		}
	}
};
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';
  .avatar-card {
	font-size: $baseFontSize;
	background: #fff;
	min-height: 100%;
	.tips {
	  border: 1PX dashed $red;
	  padding: 15px;
	  background: rgba(252, 75, 63, 0.3);
	  margin: 10px;
	}
	h2 {
	  margin: $mediumGutter 0;
	  clear: both;
	}
	.update-avatar {
	  display: flex;
	  justify-content: space-around;
	  align-items: center;
	  position: relative;
	  padding: 0 $mediumGutter;
	  p {
		color: $red;
		font-weight: bold;
		margin-left: $mediumGutter;
	  }
	  img {
		width: 100px;
	  }
	  .avatar {
		width: 30%;
		margin: 30px 0;
	  }
	  .avatar-icon {
		font-size: 100px;
		color: $grey;
	  }
	  .upload {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		opacity: 0;
		z-index: 1000;
	  }
	}
	.choose-color {
	  padding: 0 $mediumGutter;
	  .bgcolor {
		overflow: hidden;
		li {
		  float: left;
		  width: 20%;
		  height: 35px;
		  margin: $smallGutter 0;
		  span {
			display: block;
			width: calc(100% - #{$mediumGutter});
			height: 100%;
			margin: 0 auto;
			border: 1PX solid transparent;
		  }
		  &.active {
			span {
			  border-color: #c00;
			}
		  }
		}
	  }
	}
	.choose-logo {
	  padding: 0 $mediumGutter;
	  .logo {
		overflow: hidden;
		li {
		  float: left;
		  width: 20%;
		  height: 35px;
		  line-height: 35px;
		  margin: $smallGutter 0;
		  text-align: center;
		  span {
			display: block;
			width: calc(100% - #{$mediumGutter});
			height: 100%;
			margin: 0 auto;
			border: 1PX solid #ddd;
		  }
		  &.active {
			span {
			  border-color: #c00;
			}
		  }
		}
	  }
	}
	.img-con {
	  li {
		float: left;
		width: 18%;
		margin-right: 2%;
		span {
		  display: none;
		  float: left;
		  width: 100px;
		  height: 60px;
		  margin-top: 35px;
		  margin-right: 50px;
		}
		img {
		  float: left;
		  width: 100%;
		}
	  }
	}
	.new-avatar {
	  display: flex;
	  justify-content: space-around;
	  align-items: center;
	  position: relative;
	  padding: 0 $largeGutter;
	  img {
		width: 40%;
		margin-right: $mediumGutter;
	  }
	  .avatar-tip {
		color: $red;
	  }
	}
  }
</style>
