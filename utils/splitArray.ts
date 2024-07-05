export const splitData = (data: Array<any>, bundleSize: number): Array<any> => {
  // initialize new splited Data array
  let newSplitDataArray: Array<any> = [];

  // one element management item
  let item: Array<any> = [];

  // iterator for loop
  let iterator = 0;

  // loop whole data array
  for (let i = 0; i < data.length; i++) {
    if (iterator == bundleSize) {

      newSplitDataArray.push(item);
      item = [];
      iterator = 0;

    } else {
      item.push(data[i]);

      iterator++;
    }
  }
  if (iterator != 0) {
    newSplitDataArray.push(item);
  }
  return newSplitDataArray;
};
