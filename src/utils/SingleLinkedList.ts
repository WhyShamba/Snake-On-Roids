export class Node<DataType = any> {
  next: Node | null;
  data?: DataType;

  constructor(data: DataType, nextNode: Node | null = null) {
    this.data = data;
    this.next = nextNode;
  }
}

export class SingleLinkedList<DataType = any> {
  head: Node<DataType> | null;
  tail: Node<DataType> | null;

  constructor(node: Node<DataType> | null = null) {
    this.head = node;
    this.tail = node;
  }

  add = (node: Node<DataType>) => {
    if (this.head) {
      console.log('Node: ', node);
      this.head.next = node;
      this.head = node;
      console.log('Current head', this.head);
    } else {
      this.head = node;
    }
  };

  reverse = () => {
    let current = this.tail;
    let previous = null;
    while (true) {
      const temp = current!.next;
      current!.next = previous;
      //   If i'm at head
      if (temp === null) {
        this.tail = current;
        break;
      }
      if (previous === null) {
        this.head = current;
      }
      previous = current;
      current = temp!;
    }
  };

  //   Special method, not common for ;inkedList
  moveList = (newHead: Node) => {
    //   Update head
    this.head!.next = newHead;
    this.head! = this.head!.next;

    //   Update tail
    this.tail = this.tail!.next;
    if (!this.tail) {
      this.tail = this.head;
    }
  };

  print = () => {
    let current = this.tail;
    let str = '';
    while (current) {
      str += str ? `->${current.data}` : current.data;
      current = current.next;
    }
    console.log(str);
  };
}
