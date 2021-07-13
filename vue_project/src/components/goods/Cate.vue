<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary"
                     @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table :data="catelist"
                  :columns="columns"
                  :selection-type="false"
                  :expand-type="false"
                  show-index
                  index-text="#"
                  border
                  :show-row-hover="false"
                  class="treeTable">
        <!-- 是否删除的标签 -->
        <template slot="isok"
                  slot-scope="scope">
          <i class="el-icon-success"
             style="color: lightgreen"
             v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error"
             style="color: red"
             v-else></i>
        </template>
        <!-- 排序的标签 -->
        <template slot-scope="scope"
                  slot="order">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1"
                  type="success">二级</el-tag>
          <el-tag v-else
                  type="warning">三级</el-tag>
        </template>
        <!-- 操作的标签 -->
        <template slot="opt"
                  slot-scope="scope">
          <el-button type="primary"
                     icon="el-icon-edit"
                     size="mini"
                     @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger"
                     icon="el-icon-delete"
                     size="mini"
                     @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[3, 5, 10, 15]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类"
               :visible.sync="addCateDialogVisible"
               width="50%"
               @close="addCateDialogClosed">
      <el-form :model="addCateForm"
               label-width="100px"
               ref="addCateFormRef"
               :rules="addCateFormRules">
        <el-form-item label="分类名称"
                      prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader expand-trigger="hover"
                       :options="parentCateList"
                       :props="cascaderProps"
                       v-model="selectedKeys"
                       @change="parentCateChanged"
                       clearable
                       change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="编辑分类"
               :visible.sync="editCatedialogVisible"
               width="50%"
               @close="closeEditCateDialog">
      <el-form ref="editCateFormRef"
               :model="editCateForm"
               label-width="100px">
        <el-form-item label="分类名称">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editCatedialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="editCate">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>
<script>
export default {
  created () {
    this.getCateList()
  },
  data () {
    return {
      // 商品分类的数据列表，默认为空
      catelist: [],
      // 总数据条数
      total: 0,
      // 申请列表数据的参数
      queryInfo: {
        pagenum: 1,
        pagesize: 5
      },
      // 列表的竖向数据
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 开关添加分类展示框
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        cat_pid: '',
        cat_name: '',
        cat_level: ''
      },
      // 添加分类的表单规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ]
      },
      // 父级分类的数据
      parentCateList: [],
      // 父级分类中选中的值
      selectedKeys: [],
      // 选择器中 的 props
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 编辑分类对话框
      editCatedialogVisible: false,
      // 编辑分类表单数据
      editCateForm: {
        cat_name: '',
        cat_id: ''
      }
    }
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
      this.catelist = res.data.result
      this.total = res.data.total
      console.log(this.catelist)
    },
    // 分页功能
    // 当页码发生变化时候
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    // 当最近页码发生变化时候
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    // 打开添加分类展示框
    showAddCateDialog () {
      // 先获取父级分类的数据列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 选择器内容发生变化时
    parentCateChanged () {
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id 永远是数组的末尾向数据
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类 Id
        this.addCateForm.cat_pid = 0
        // 为当前分类等级赋值
        this.addCateForm.cat_level = 0
      }
    },
    // 点击确认完成添加表单的操作
    async addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valide => {
        if (!valide) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 表单关闭时候重置表单
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    /* 编辑分类操作 */
    // 点击按钮打开编辑分类对话框
    async showEditCateDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取相关分类失败')
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateForm.cat_id = res.data.cat_id
      this.editCatedialogVisible = true
    },
    // 完成编辑 id 操作
    async editCate () {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
        cat_name: this.editCateForm.cat_name
      })
      if (res.meta.status !== 200) return this.$message.error('分类名更新失败')
      this.$message.success('分类名更新成功！')
      this.getCateList()
      this.editCatedialogVisible = false
    },
    // 关闭对话框时 重置表单
    closeEditCateDialog () {
      this.$refs.editCateFormRef.resetFields()
      this.editCateForm = {
        cat_name: '',
        cat_id: ''
      }
    },
    // /* 删除分类操作 */
    async deleteCate (id) {
      const confirmRes = await this.$confirm('确认删除此类名吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('你已取消了删除')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>
