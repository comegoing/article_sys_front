<template>
  <a-layout id="main-top">
    <a-layout-header class="header">
      <div class="logo"><a-icon type="home" /> arXiv论文筛选与管理系统</div>
    </a-layout-header>
    <p></p>
    <a-layout class="body">
      <a-layout-sider class="left-side" :width="300">
        <div class="select">
          <a-icon type="edit" theme="twoTone" /> 筛选条件
          <a-button class="clear" type="primary">
            <a-icon type="delete" theme="filled" />清除筛选
          </a-button>
        </div>

        <a-row class="opotions">
          <p class="label">时间筛选</p>
          <a-range-picker :locale="locale" class="date" />
        </a-row>

        <a-row class="opotions">
          <p class="label">类别筛选</p>
          <a-radio-group v-model="value">
            <a-radio :style="radioStyle" :value="1"> Option A </a-radio>
            <a-radio :style="radioStyle" :value="2"> Option B </a-radio>
            <a-radio :style="radioStyle" :value="3"> Option C </a-radio>
          </a-radio-group>
        </a-row>
        <a-row class="opotions">
          <p class="label">关键字搜索</p>
          <a-input-search
            class="query-search"
            placeholder="请输入关键字条件"
            enter-button
          />
        </a-row>
        <a-row class="opotions">
          <p class="label">排序方式</p>
          <a-select default-value="lucy" style="width: 220px">
            <a-select-option value="jack"> Jack </a-select-option>
            <a-select-option value="lucy"> Lucy </a-select-option>
            <a-select-option value="disabled" disabled>
              Disabled
            </a-select-option>
            <a-select-option value="Yiminghe"> yiminghe </a-select-option>
          </a-select>
        </a-row>
      </a-layout-sider>
      <a-layout-content class="content"> Content </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
export default {
  data() {
    return {
      radioStyle: {
        display: "block",
        height: "30px",
        lineHeight: "30px",
        fontSize: "18px",
      },
      collapsed: false,
      locale,
      value: "1",
    };
  },
};
</script>

<style>
#main-top .logo {
  color: #1a56db;
  font-weight: bold;
  font-size: 24px;
  width: auto;
  height: 100%;
  background: none;
}
.select {
  color: black;
  font-weight: bold;
  font-size: 22px;
  width: auto;
  background: none;
  margin-bottom: 20px;
}
.header {
  background: #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  border-bottom: 1px solid #f0f0f0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
  height: 60px !important;
}
.body {
  height: calc(100vh - 60px) !important; /* 减去header高度 */
  width: 100%;
  display: flex;
}
.left-side {
  background: #fff !important;
  height: 500px !important; /* 充满父容器高度 */
  padding: 10px 10px;
  margin: 0 10px 10px 10px;
}
.content {
  margin: 0 20px;
  padding: 10px 10px;
  background: #fff;
}
.date {
  width: 220px !important;
}
.label {
  color: black;
  font-size: 18px;
  margin-bottom: 5px;
}
.opotions {
  padding-left: 20px;
  margin-bottom: 20px;
  height: 50px;
  width: 100%;
}
.query-search {
  width: 220px !important;
}
.clear {
  margin-left: 10px;
}
</style>
