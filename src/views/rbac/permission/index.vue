<template>
  <el-card>
    <el-row v-loading="loading" class="auth-menu">
      <el-col :span="6">
        <el-tree
          ref="tree"
          :data="items"
          show-checkbox
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          @current-change="select"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ data.label }}</span>
            <span>
              <el-button size="mini" type="text" @click="append(data)">
                <i class="el-icon-circle-plus" />
              </el-button>

              <el-button size="mini" type="text" @click="remove(node, data)">
                <i class="el-icon-remove" />
              </el-button>
            </span>
          </span>
        </el-tree>
      </el-col>
      <el-col :span="6" :v-show="showChildren">
        <el-card shadow="never">
          <div slot="header">
            <span style="line-height: 28px;">卡片名称</span>
            <el-button style="float:right" size="mini" plain>操作按钮</el-button>
          </div>
          <div v-for="button in current.buttons" :key="button.id">
            {{ button.label }}
          </div>
        </el-card>
        <el-card shadow="never" class="mt-2">
          <div slot="header">
            <span style="line-height: 28px;display: inline-block">访问资源</span>
            <el-button style="float:right" size="mini" plain>添加资源</el-button>
          </div>
          <div v-for="button in current.resources" :key="button.id">
            {{ button.path }}
          </div>
        </el-card>
      </el-col>
      <el-col v-show="showChildren && showButton" :span="6" :offset="6" class="auth-menu-editor">
        <el-form ref="submit-form" label-width="70">
          <el-form-item
            label="按钮标题"
            prop="label"
            :rules="{required: true, message: '请输入按钮标题', trigger: 'blur'}"
          >
            <el-input v-model="current.path" clearable />
          </el-form-item>
          <el-form-item
            label="按钮命名"
            prop="name"
            :rules="{required: true, message: '请输入按钮命名', trigger: 'blur'}"
          >
            <el-input v-model="current.path" clearable />
          </el-form-item>
          <el-form-item class="text-center">
            <el-button
              type="primary"
              icon="md-checkmark"
              class="m-2"
              :loading="submitLoading"
              @click="handleSubmit"
            >提交</el-button>
            <el-button
              type="default"
              icon="md-refresh"
              class="m-2"
              @click="$refs.submitForm.resetFields()"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col v-show="showChildren && showResource" :span="6" :offset="6" class="auth-menu-editor">
        <el-form ref="submit-form" label-width="70">
          <el-form-item
            label="资源路径"
            prop="path"
            :rules="{required: true, message: '请输入资源路径', trigger: 'blur'}"
          >
            <el-input v-model="current.path" clearable />
          </el-form-item>
          <el-form-item class="text-center">
            <el-button
              type="primary"
              icon="md-checkmark"
              class="m-2"
              :loading="submitLoading"
              @click="handleSubmit"
            >提交</el-button>
            <el-button
              type="default"
              icon="md-refresh"
              class="m-2"
              @click="$refs.submitForm.resetFields()"
            >重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </el-card>

</template>
<script>
export default {
  name: 'Permission',
  data() {
    return {
      hostUrl: location.protocol + '//' + location.host,
      loading: false,
      submitLoading: false,
      showChildren: false,
      showButton: false,
      showResource: false,
      current: {},
      items: []
    }
  },

  mounted() {
    this.$nextTick(() => { this.getMenus() })
  },
  methods: {
    handleSubmit() {
      this.submitLoading = true
      this.$refs.formItem.validate((valid) => {
        if (valid) {
          this.submitLoading = false
        } else {
          this.submitLoading = false
        }
      })
    },

    getMenus() {
      this.loading = true
      setTimeout(() => {
        this.items = [
          {
            id: 1,
            label: '用户管理',
            name: 'user_manager',
            path: '/user',
            parentId: 0,
            status: 1,
            sort: 1,
            isButton: false,
            isResource: false,
            children: [{
              id: 4,
              label: '二级 1-1',
              name: 'user_manager',
              path: '/user',
              parentId: 1,
              status: 1,
              sort: 1,
              isButton: false,
              isResource: false,
              buttons: [{
                id: 9,
                label: '三级 1-1-1',
                name: 'user_manager',
                path: '/user',
                parentId: 4,
                status: 1,
                sort: 1,
                isButton: true,
                isResource: false
              }],
              resources: [{
                id: 10,
                label: '三级 1-1-2',
                name: 'user_manager',
                path: '/user',
                parentId: 4,
                status: 1,
                sort: 2,
                isButton: false,
                isResource: true
              }]
            }]
          },
          {
            id: 2,
            label: '订单管理',
            name: 'order_manager',
            path: '/order',
            parentId: 0,
            status: 1,
            sort: 2,
            isButton: false,
            isResource: false,
            children: []
          }
        ]
        this.loading = false
      }, 200)
    },

    select(data, node) {
      this.showChildren = true
      if (data.isButton) {
        this.showButton = true
      } else if (data.isApi) {
        this.showResource = true
      }
      this.current = data
    },

    append(data) {
      const child = {
        id: null,
        label: '',
        name: '',
        path: '',
        isButton: false,
        isResource: false,
        parentId: data.id,
        status: 1,
        sort: data.children ? data.children.length + 1 : 1
      }
      if (!data.children) {
        this.$set(data, 'children', [])
      }
      data.children.push(child)
      this.$message.success('已添加一个节点，赶快去看看吧！')
    },

    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex(d => d.id === data.id)
      children.splice(index, 1)
    }

  }
}
</script>
<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
