public static class MyArrayList {

	// 列表数组
	int[] elementData;

	// 列表中的元素个数
	int size;

	// 构造函数

	// 默认构造函数，构造一个容量为10的空列表
	MyArrayList() {

	}

	// 用于测试的main函数
	public static void main(String[] args) {
		int[] list0 = { 1, 2, 3, 4, 5, 6, 7 };

		int[] newList = new int[capacity];

		// initial test
		MyArrayList list1 = new MyArrayList();
		MyArrayList list2 = new MyArrayList(5);
		MyArrayList list3 = new MyArrayList(list0, list1);

		elementData[--size] = 0;

	}

}
