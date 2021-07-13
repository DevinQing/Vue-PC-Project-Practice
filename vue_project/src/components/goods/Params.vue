<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon>
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader v-model="selectedCateKeys"
                       :options="cateList"
                       :props="selectCateProps"
                       @change="selectedCateChange"
                       size='medium'
                       clearable></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName"
               @tab-click="handleClick"
               class="eltabs">
        <el-tab-pane label="动态参数"
                     name="many">
          <!-- 添加动态参数按钮 -->
          <el-button type="primary"
                     :disabled="isBtnDisabled"
                     @click="showAddDialog">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="this.manyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        @close="removeTags(i,scope.row)">
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index">
            </el-table-column>
            <!-- 属性名称列 -->
            <el-table-column prop="attr_name"
                             label="属性名称">
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="deletParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性"
                     name="only">
          <el-button type="primary"
                     :disabled="isBtnDisabled"
                     @click="showAddDialog">添加属性</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="this.onlyTableData"
                    border
                    stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag closable
                        v-for="(item,i) in scope.row.attr_vals"
                        :key="i"
                        @close="removeTags(i,scope.row)">
                  {{item}}
                </el-tag>
                <el-input class="input-new-tag"
                          v-if="scope.row.inputVisible"
                          v-model="scope.row.inputValue"
                          ref="saveTagInput"
                          size="small"
                          @keyup.enter.native="handleInputConfirm(scope.row)"
                          @blur="handleInputConfirm(scope.row)">
                </el-input>
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index">
            </el-table-column>
            <!-- 属性名称列 -->
            <el-table-column prop="attr_name"
                             label="属性名称">
            </el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary"
                           size="mini"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger"
                           size="mini"
                           icon="el-icon-delete"
                           @click="deletParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!-- 添加属性对话框 -->
      <el-dialog :title="'添加'+titleText"
                 :visible.sync="addDialogVisible"
                 width="50%"
                 @close="addDialogClosed">
        <el-form ref="addFormRef"
                 :model="addFormData"
                 label-width="100px"
                 :rules="addFormRules">
          <el-form-item :label="titleText"
                        prop="attr_name">
            <el-input v-model="addFormData.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑属性对话框 -->
      <el-dialog :title="'修改'+titleText"
                 :visible.sync="editDialogVisible"
                 width="50%"
                 @close="editDialogClosed">
        <el-form ref="editFormRef"
                 :model="editFormData"
                 label-width="100px"
                 :rules="editFormRules">
          <el-form-item :label="titleText"
                        prop="attr_name">
            <el-input v-model="editFormData.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"
              class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary"
                     @click="editForm">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 分类列表
      cateList: [],
      // 选中的值
      selectedCateKeys: [],
      // 选配置级联选择器的 props
      selectCateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 页签被激活标签的名字
      activeName: 'many',
      // 是否禁用选择按钮

      // 动态参数的数据
      manyTableData: [],
      // 静态参数的数据
      onlyTableData: [],
      // 显示对话框
      addDialogVisible: false,
      // 添加动态参数或者静态参数数据
      addFormData: {
        attr_name: ''
      },
      // 添加动态参数或静态属性规则
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改动态参数对话框
      editDialogVisible: false,
      // 修改动态参数表单数据
      editFormData: {
      },
      // 修改对话框表单规则
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 显示标签还是按钮
      inputVisible: false,
      // 标签输入框里面的值
      inputValue: '',
      // 标签里的数据
      paramsTagsData: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败')
      this.cateList = res.data
    },
    selectedCateChange () {
      this.getParamsData()
    },
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      console.log(this.paramsTagsData)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击页签标题获得触发事件
    handleClick () {
      this.getParamsData()
    },
    showAddDialog () {
      this.addDialogVisible = true
      console.log()
    },
    // 关闭添加属性对话框
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addFormData.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 打开修改对话框
    async showEditDialog (val) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${val.attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取参数信息失败！')
      this.editFormData = res.data
      this.editDialogVisible = true
      console.log(val)
    },
    // 关闭修改对话框
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定之后完成编辑操作
    async editForm () {
      console.log(this.editFormData)
      const { data: res } = await this.$http.put(`categories/${this.editFormData.cat_id}/attributes/${this.editFormData.attr_id}`, {
        attr_name: this.editFormData.attr_name,
        attr_sel: this.activeName,
        attr_vals: this.editFormData.attr_vals
      })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('修改参数失败')
      this.$message.success('修改参数成功！')
      this.getParamsData()
      this.editDialogVisible = false
    },
    // 删除 参数
    async deletParams (id) {
      const confirmRes = await this.$confirm('是否确定删除该参数', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('你已经取消了删除')
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败')
      this.$message.success('删除参数成功')
      this.getParamsData()
    },
    // 按下标签和和失去焦点 都会触发的事件
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有 return ，则证明输入的内容 需要做后续处理
      row.attr_vals.push(row.inputValue)
      this.saveTagsChange(row)
    },
    // 发起 标签改变请求
    async saveTagsChange (row) {
      const { data: res } = await this.$http.put(`categories/${row.cat_id}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('标签操作失败')
      this.$message.success('标签操作成功')
      row.inputValue = ''
      row.inputVisible = false
      console.log(res)
    },
    // 删除标签
    async removeTags (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveTagsChange(row)
    },
    // 展示标签输入框
    showInput (row) {
      row.inputVisible = true
      // 主要用于获得焦点
      // $nextTick 方法的作用是当页面元素被重置之后 再执行回调函数中的内容
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    }
  },
  computed: {
    isBtnDisabled () {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin-top: 20px;
}
.eltabs {
    margin-top: 15px;
}
.el-tag + .el-tag {
    margin-left: 10px;
    margin-top: 10px;
}
.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
