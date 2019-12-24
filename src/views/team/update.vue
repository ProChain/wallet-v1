<template>
<div class="team-update-component">
  <div class="team-update">
	<ValidationObserver v-slot="{ invalid }">
	  <van-cell-group title="团队标识" :border="false">
		<ValidationProvider v-slot="{ errors }" rules="required" name="symbol">
		  <van-field
		  v-model="didForm.symbol"
		  :error-message="errors[0]"
		  placeholder="请设置您的团队标识" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="描述信息" :border="false">
		<ValidationProvider v-slot="{ errors }" name="description">
		  <van-field v-model="didForm.description"
		  :error-message="errors[0]"
		  placeholder="请输入描述" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-cell-group title="团队网址" :border="false">
		<ValidationProvider v-slot="{ errors }" name="website">
		  <van-field v-model="didForm.website"
		  :error-message="errors[0]"
		  placeholder="请输入团队网址" />
		</ValidationProvider>
	  </van-cell-group>
	  <van-button type="primary" square
	  class="btn-submit"
	  size="large"
	  :disabled="invalid" @click="handleSubmit">更新团队</van-button>
	</ValidationObserver>
  </div>
</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { SET_TEAM_INFO } from '@/vuex/constants'
import { updateTeamInfo } from '@/util/api'
export default {
	name: 'teamUpdate',
	data() {
		return {
			didForm: {
				symbol: '',
				url: ''
			}
		}
	},
	computed: {
		...mapState([
			'walletInfo',
			'teamInfo'
		])
	},
	components: {
		ValidationProvider,
		ValidationObserver
	},
	mounted() {
		this.didForm.symbol = this.teamInfo.symbol
	},
	methods: {
		async handleSubmit() {
			this.$store.commit('showLoading')

			const rs = await updateTeamInfo(this.walletInfo.did, this.didForm.url, this.didForm.symbol)
			if (rs.hasErrors) {
				this.$store.commit('hideLoading')
				return this.$toast.error(rs.message)
			}
			const teamInfo = {
				...this.teamInfo,
				...this.didForm
			}
			this[SET_TEAM_INFO](teamInfo)
			this.$store.commit('hideLoading')
			this.$router.push(('/team'))
		},
		...mapActions([
			SET_TEAM_INFO
		])
	}
};
</script>
