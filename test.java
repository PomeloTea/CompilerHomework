public static class MyArrayList {

	
	boolean add(int index, int element) {
		if (index > this.size || index < 0) {
			return false;
		} else {
			ensureCapacity(++this.size);
			for (int i = this.size - 1; i > index; i--) {
				this.elementData[i] = this.elementData[i - 1];
			}
			this.elementData[index] = element;
			return true;
		}
	}

}
