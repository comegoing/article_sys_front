<template>
  <a-modal
    title="搜索论文"
    :visible="searchModalVisable"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="确认"
    cancelText="取消"
    :closable="false"
  >
    <a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-model-item label="论文类型">
        <a-select v-model="form.articleType">
          <a-select-option
            v-for="(item, index) in articleOptions"
            :key="index"
            :value="item.value"
          >
            {{ item.label }}</a-select-option
          >
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="论文日期">
        <a-range-picker
          :locale="locale"
          v-model="form.date"
          style="width: 100%"
          type="date"
        />
      </a-form-model-item>
      <a-form-model-item label="论文数量">
        <a-input v-model="form.number" />
      </a-form-model-item>
    </a-form-model>
  </a-modal>
</template>
<script>
import locale from "ant-design-vue/es/date-picker/locale/zh_CN";
import { ARTICLE_OPTIONS } from "../utils/constant";
export default {
  name: "SearchModal",
  props: {
    searchModalVisable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 筛选类别选择
      articleOptions: [],
      locale,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        articleType: undefined,
        date: undefined,
        number: undefined,
      },
    };
  },
  methods: {
    // 取消搜索
    handleCancel() {
      this.$emit("closeSearch");
    },
    // 确定搜索
    handleOk() {
      this.$emit("search", this.form);
    },
  },
  created() {
    this.articleOptions = ARTICLE_OPTIONS;
  },
};
</script>
