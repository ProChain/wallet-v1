<template>
  <div class="team-logo">
	<div class="container">
	  <h2>当前LOGO</h2>
		<div class="update-logo">
		  <div v-if="logo" class="logo">
			<img :src="logo"/>
		  </div>
		  <van-icon v-else class="logo-icon" name="user-circle-o" />
		  <input type="file" ref="file" @change="handleUpload" class="upload-btn">
		  <p>点击LOGO修改</p>
		</div>
		<van-button size="large" type="primary" @click="handleSubmit">确认修改</van-button>
	  </div>
	</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { uploadImg, buildTeam } from '@/util/api'
import { SET_TEAM_INFO } from '@/vuex/constants'
export default {
	name: 'teamLogo',
	data() {
		return {
			logo: '',
			file: null
		};
	},
	computed: {
		...mapState([
			'walletInfo',
			'teamInfo'
		])
	},
	mounted() {
		this.logo = this.teamInfo.url
	},
	methods: {
		async handleUpload() {
			const file = this.$refs.file.files[0]
			const maxFileSize = 1024 * 1024 * 10
			if (!/.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(file.name)) {
				return this.$toast('图片类型必须是gif,jpeg,jpg,png中的一种')
			}
			if (file.size > maxFileSize) {
				return this.$toast('图片尺寸超过10M了')
			}
			const data = new FormData()

			data.append('file', file)
			const rs = await uploadImg(data)
			this.logo = `https://static.chain.pro/${rs.data}`
		},
		async handleSubmit() {
			if (!this.logo) return this.$toast('请选择logo')
			const rs = await buildTeam({ did: this.walletInfo.did, url: this.logo })
			if (rs.hasErrors) this.$toast.error(rs.message)
			this[SET_TEAM_INFO]({
				...this.teamInfo,
				url: this.logo
			})
			this.$router.go(-1)
		},
		...mapActions([
			SET_TEAM_INFO
		])
	}
}
</script>

<style lang="scss">
  @import '../../assets/css/variables.scss';
  .team-logo {
	.container {
	  font-size: $baseFontSize;
	  padding: 0 $mediumGutter;
	  h2 {
		margin: 20px 0;
		clear: both;
	  }
	  .update-logo {
		display: flex;
		justify-content: space-around;
		align-items: center;
		position: relative;
		margin: 80px 0;
		p {
		  color: $red;
		  font-weight: bold;
		  margin-top: 10px;
		}
		img {
		  width: 150px;
		}
		.logo {
		  width: 30%;
		  margin: 30px 0;
		  background-color: #999;
		  border-radius: 100%;
		  img {
			width: 100%;
		  }
		}
		.logo-icon {
		  font-size: 100px;
		  color: $grey;
		}
		.ivu-upload {
		  position: absolute;
		  width: 100%;
		  height: 100%;
		  overflow: hidden;
		  left: 0;
		  top: 0;
		  z-index: 999;
		}
		.upload-btn {
		  position: absolute;
		  width: 100%;
		  height: 100%;
		  left: 0;
		  top: 0;
		  opacity: 0;
		  z-index: 1000;
		}
	  }
	  .submit {
		margin-top: 60px;
	  }
	}
  }
</style>
