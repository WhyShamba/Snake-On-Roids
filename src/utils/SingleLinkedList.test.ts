import { DIRECTION } from '../types/types';
import { Node, SingleLinkedList } from './SingleLinkedList';
import { getOppositeDirection } from './snake/snake-coordination';

test(`Test reverse snake method: 
        CASE 
        l <- u
        |    ^
        \/   |
        d    u
            ^
            |
            l <- l

        u -> r
        /\   |
        |   \/
        u    d
            |
            \/
            d -> r  
`, () => {
  const snake = new SingleLinkedList(new Node(DIRECTION.LEFT));
  snake.add(new Node(DIRECTION.LEFT));
  snake.add(new Node(DIRECTION.UP));
  snake.add(new Node(DIRECTION.UP));
  snake.add(new Node(DIRECTION.LEFT));
  snake.add(new Node(DIRECTION.DOWN));

  //   snake.print();

  expect(snake.print()).toMatch('0->0->1->1->0->3');

  let transitions = 0;
  snake.reverse((reversedNode) => {
    const nextNodeDirection = reversedNode.next?.data;
    const currentNodeDirection = reversedNode.data!;
    // const currentNodeDirectionReversed = getOppositeDirection(currentNodeDirection)
    const isTransitional = currentNodeDirection !== nextNodeDirection;

    if (isTransitional && nextNodeDirection !== undefined) {
      reversedNode.data = getOppositeDirection(nextNodeDirection);
      transitions += 1;
    } else {
      reversedNode.data = getOppositeDirection(currentNodeDirection);
    }
  });
  expect(transitions).toEqual(3);

  expect(snake.print()).toMatch('1->1->2->3->3->2');
});

export {};
