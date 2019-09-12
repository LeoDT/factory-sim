import { observable, autorun, IReactionDisposer, decorate, computed } from 'mobx';

import { NodeType, Node, makeAndStartNode } from '~core/node';
import { Link, makeAndStartLink } from '~core/link';
import { Storage, makeStorage, StorageType } from '~core/storage';
import { Port } from '~core/port';

import UI from './ui';
import {
  BoardType,
  Board,
  addThingToBoard,
  removeThingFromBoard,
  makeAndStartBoard,
  ThingOnBoard,
  boardAcceptThing
} from '~core/board';
import { tileGroupContainsAnother } from '~core/tile';
import { Slot } from '~core/slot';
export class Store {
  public ui = new UI();

  public nodes = observable.array<Node>([], { deep: false });
  public links = observable.array<Link>([], { deep: false });
  public storages = observable.array<Storage>([], { deep: false });
  public boards = observable.array<Board>([], { deep: false });
  public slots = observable.array<Slot>([], { deep: false });

  public get thingsNotOnBoard(): ThingOnBoard[] {
    const things: ThingOnBoard[] = [];

    this.nodes.forEach(n => {
      if (!this.boards.some(b => b.nodes.has(n))) {
        things.push(n);
      }
    });

    this.slots.forEach(s => {
      if (!this.boards.some(b => b.slots.has(s))) {
        things.push(s);
      }
    });

    return things;
  }

  private boardDisposers = new Map<Board, IReactionDisposer>();

  public addNode(nodeType: NodeType, tile: Vector2): Node {
    const node = makeAndStartNode(nodeType, tile);

    this.nodes.push(node);

    return node;
  }

  public addLink(from: Port, to: Port): Link {
    const link = makeAndStartLink(from, to);

    this.links.push(link);

    return link;
  }

  public addStorage(storageType: StorageType): Storage {
    const storage = makeStorage(storageType);

    this.storages.push(storage);

    return storage;
  }

  public addBoard(boardType: BoardType, tile: Vector2): Board {
    const board = makeAndStartBoard(boardType, tile);

    this.boards.push(board);

    this.boardDisposers.set(
      board,
      autorun(() => {
        for (const slot of board.slots) {
          if (this.slots.indexOf(slot) === -1) {
            this.slots.push(slot);
          }
        }
      })
    );

    return board;
  }

  public checkThingInBoards(t: ThingOnBoard): Board | undefined {
    const lastBoard = this.boards.find(b => b.thingsOnBoard.has(t));
    const board = this.boards.find(b => {
      if (boardAcceptThing(b, t)) {
        return tileGroupContainsAnother(b.tileGroup, t.tileGroup);
      }

      return false;
    });

    if (lastBoard) {
      removeThingFromBoard(lastBoard, t);
    }

    if (board) {
      addThingToBoard(board, t);
    }

    return board;
  }

  public checkBoardWrapThings(b: Board): ThingOnBoard[] {
    const things = this.thingsNotOnBoard.filter(t =>
      tileGroupContainsAnother(b.tileGroup, t.tileGroup)
    );

    things.forEach(t => {
      addThingToBoard(b, t);
    });

    return things;
  }

  public addThingOrBoard(
    o: ThingOnBoard | Board,
    tile: Vector2,
    preserveShape: boolean = false
  ): ThingOnBoard | Board | null {
    let tob: ThingOnBoard | Board | null = null;

    switch (o._type) {
      case 'Node':
        const nodeType = preserveShape
          ? {
              ...o.nodeType,
              shape: o.tileGroup.transformedShape
            }
          : o.nodeType;

        tob = this.addNode(nodeType, tile);
        this.checkThingInBoards(tob);
        break;

      case 'Board':
        tob = this.addBoard(o.boardType, tile);
        this.checkBoardWrapThings(tob);
        break;

      default:
        break;
    }

    return tob;
  }

  public portUIElements = observable.map<Port, HTMLElement>(new Map<Port, HTMLElement>(), {
    deep: false
  });

  public updatePortUIElement(port: Port, e: HTMLElement): void {
    this.portUIElements.set(port, e);
  }
}

decorate(Store, {
  thingsNotOnBoard: computed
});
