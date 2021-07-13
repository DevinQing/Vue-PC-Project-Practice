<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-button type="primary"
                 @click="showAddRoleDialog">添加角色</el-button>
      <el-table :data="rolesList"
                stripe
                border
                row-key="id">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children"
                    :key="item1.id"
                    :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable
                        @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children"
                        :key="item2.id"
                        :class="[i2 ===0 ? '' : 'bdtop','vcenter']">
                  <!-- 渲染二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success"
                            closable
                            @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning"
                            v-for="item3 in item2.children"
                            :key="item3.id"
                            closable
                            @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index">
        </el-table-column>
        <el-table-column prop="roleName"
                         label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc"
                         label="角色描述">
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary"
                       icon="el-icon-edit"
                       @click="editRoles(scope.row)">编辑</el-button>
            <el-button type="danger"
                       icon="el-icon-delete"
                       @click="deletRole(scope.row.id)">删除</el-button>
            <el-button type="warning"
                       icon="el-icon-setting"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限"
               :visible.sync="setRightDialogVisible"
               width="50%"
               @close="setRightDialogClosed">
      <el-tree :data="rightList"
               :props="treeProps"
               show-checkbox
               default-expand-all
               node-key="id"
               :default-checked-keys="defKeys"
               ref="treeRef"></el-tree>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色"
               :visible.sync="editRoleDialogVisible"
               width="50%">
      <el-form ref="editRoleFormRef"
               :model="editRoleFormData"
               label-width="100px"
               :rules="editRoleFormRules">
        <el-form-item label="角色名字"
                      prop="roleName">
          <el-input v-model="editRoleFormData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleFormData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="cptEdit">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色"
               :visible.sync="addRoleDialogVisible"
               width="50%">
      <el-form ref="addRoleFormRef"
               :model="addRoleFormData"
               label-width="100px"
               :rules="addRoleRules">
        <el-form-item label="角色名字"
                      prop="roleName">
          <el-input v-model="addRoleFormData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleFormData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getRolesList()
  },
  data () {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightList: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中权限的 id值
      defKeys: [],
      // 当前即将分配权限的 id
      roleId: '',
      // 编辑角色对话框
      editRoleDialogVisible: false,
      // 编辑角色表单数据
      editRoleFormData: {
        roleName: '',
        roleDesc: '',
        id: 0
      },
      // 编辑角色校验规则
      editRoleFormRules: {
        roleName: [
          { required: true, message: '角色名不能为空', trigger: 'blur' }
        ]
      },
      // 添加角色的对话框
      addRoleDialogVisible: false,
      // 添加角色的数据
      addRoleFormData: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          { required: true, message: '角色名不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取权限列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 删除权限标签
    async removeRightById (role, rightId) {
      const confirmRes = await this.$confirm('是否删除确定标签', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除权限失败')
      // 防止列表的刷新 从而提升用户的体验
      role.children = res.data
    },
    async showSetRightDialog (role) {
      // 获取用户权限 list 数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
      this.rightList = res.data

      // 通过递归获取三级节点的 id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
      this.roleId = role.id
    },

    // 通过递归的形式，获取角色下所有三级权限的id 并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前节点 不包含 children 属性，则是 三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭窗口时重置权限
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
    // 编辑角色
    editRoles (row) {
      console.log(row)
      this.editRoleFormData.roleName = row.roleName
      this.editRoleFormData.roleDesc = row.roleDesc
      this.editRoleFormData.id = row.id
      this.editRoleDialogVisible = true
    },
    async cptEdit () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('角色名不能为空')
        const { data: res } = await this.$http.put(`roles/${this.editRoleFormData.id}`, {
          roleName: this.editRoleFormData.roleName,
          roleDesc: this.editRoleFormData.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error('角色编辑失败')
        this.$message.success('角色编辑成功！')
        this.editRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 删除角色
    async deletRole (id) {
      // console.log(id)
      const confirmRes = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmRes)
      if (confirmRes !== 'confirm') return this.$message.info('你已取消了删除')
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 打开添加角色对话框
    showAddRoleDialog () {
      this.addRoleDialogVisible = true
    },
    // 完成添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入必填信息！')
        const { data: res } = await this.$http.post('roles', {
          roleName: this.addRoleFormData.roleName,
          roleDesc: this.addRoleFormData.roleDesc
        })
        if (res.meta.status !== 201) return this.$message.error('角色创建失败！')
        this.$message.success('角色创建成功')
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 8px;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.bdtop {
    border-top: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>
