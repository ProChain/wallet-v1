<template>
	<div class="team-update-component">
		<div class="team-update">
			<ValidationObserver v-slot="{ invalid }" ref="form">
				<van-cell-group title="团队名称" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="name">
						<van-field v-if="pageType !== 'create'" v-model="teamInfo.name" disabled />
						<van-field v-else v-model="didForm.name" :error-message="errors[0]" placeholder="请输入团队名称" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队标识" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="symbol">
						<van-field v-model="didForm.symbol" :error-message="errors[0]" placeholder="请设置您的团队标识" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="描述信息" :border="false">
					<ValidationProvider v-slot="{ errors }" name="description">
						<van-field v-model="didForm.description" :error-message="errors[0]" placeholder="请输入描述" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队网址" :border="false">
					<ValidationProvider v-slot="{ errors }" name="website">
						<van-field v-model="didForm.website" :error-message="errors[0]" placeholder="请输入团队网址" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队标签" :border="false">
					<van-cell is-link :to="{path: '/team/tags', query: {...$route.query}}" :replace="true" title-class="tag-title">
						<div v-if="didForm.tags.length > 0" slot="title">
							<span v-for="item in didForm.tags">
								{{ item }}
							</span>
						</div>
						<span v-else slot="title">请选择标签</span>
					</van-cell>
				</van-cell-group>
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleSubmit">{{ btnText }}</van-button>
			</ValidationObserver>
		</div>
	</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { SET_TEAM_INFO, DISPATCH_SIGN } from '@/vuex/constants'
import { buildTeam } from '@/util/api'
const intialFormData = {
	name: '',
	symbol: '',
	url: '',
	website: '',
	description: '',
	tags: []
}
export default {
	name: 'teamUpdate',
	data() {
		return {
			pageType: '',
			didForm: Object.assign({}, intialFormData),
			btnText: '更新团队'
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
	activated() {
		const { type, selected } = this.$route.query
		this.pageType = type
		if (this.pageType === 'create') {
			this.btnText = '创建团队'
		} else {
			this.didForm = {
				...intialFormData,
				...this.teamInfo
			}
		}
		if (selected) {
			this.didForm.tags = selected
		}
	},
	methods: {
		async handleSubmit() {
			// register name to chain
			if (this.pageType === 'create') {
				const data = {
					address: this.walletInfo.address,
					method: 'setGroupName',
					params: [this.didForm.name]
				}
				this[DISPATCH_SIGN](data)
			} else {
				this.didForm.name = this.teamInfo.name
			}

			const rs = await buildTeam({
				...this.didForm,
				did: this.walletInfo.did
			})
			if (rs.hasErrors) {
				return this.$toast.error(rs.message)
			}

			// update team info
			const teamInfo = {
				...this.teamInfo,
				...this.didForm
			}
			this[SET_TEAM_INFO](teamInfo)

			// reset
			this.didForm = Object.assign({}, intialFormData)
			this.$refs.form.reset()
			this.$router.go(-1)
		},
		...mapActions([
			SET_TEAM_INFO,
			DISPATCH_SIGN
		])
	}
}
</script>
<style>
	.tag-title {
		color: #969799;
	}
</style>
