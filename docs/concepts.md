# 基本概念

## Tile

游戏场景基本由 `Tile` 构成, 一个 `Tile` 是一个固定大小的正方形. `Tile` 是虚拟概念, 不存在实体, 实体都是 `TileGroup`.

### TileGroup

玩家在场景中可以拖动的东西都是一个 `TileGroup`.
`TileGroup` 由若干个 `Tile` 按照一定规则拼接而成, 使用数组逐行定义, `1`为有 `Tile`, `0`为空, 如:

```
// 凸形状
[
  [0, 1, 0],
  [1, 1, 1]
]
```

### TileScene

承载 `TileGroup`, 管理 `TileGroup` 大小/位置/碰撞计算等.

### Layer

处在同 Layer 的 TileGroup 会产生碰撞, 无法重叠放置, 比如 `Node` 和 `Node`, `Node` 和 `Slot` 等.

## Resource

即资源, 基本资源可以由系统或者 `Node` 产生, 一般不用消耗其它资源. 大部分资源则需要用其它资源通过 `Node` 生产.

在定义资源时指定需要什么资源来生产. 如生产 C 资源需要一个 A 资源和一个 B 资源, 那么可以简单定义为:

```javascript
{ name: 'C', requirements: [ { name: 'A', amount: 1}, { name: 'B', amount 1} ] }
```

## Slot

`Slot` 是一个 1x1 的 `TileGroup`, 可以承载一定数量的*某一种*资源.

资源需要由 `Slot` 承载才能放置在 `TileScene` 上.

大部分可的 `Slot` 由 `Board` 产生. `Node` 也会产生 `Slot`, 但是这类 `Slot` 不会出现在 `TileScene` 中(即 `Node Slot`).

## Node

在一定的周期内将某一些资源(`input`)转换成另一些资源(`output`).

### Node Slot

暂存所需和所产生的资源的 `Slot`, 有两组:

1. 生成 `output` 的资源种类数量的 `output slots`.
1. 根据 `output` 的 `requirements` 自动计算所需资源, 生成对应资源种类数量的 `input slots`.

暂存可以比较有效的改善以下问题:

1. 效率较低的 `Node` 等待的资源总是被效率较高的 `Node` 抢走.
1. 因为没有可以用的 `Tile` 导致的无法产生新的 `Slot` 接收 `Node` 的 `output` 导致没有资源被消耗.
1. 可以统一资源转移时的逻辑, 即资源只会在 `Slot` 之间转移.

## Board

`Slot` 和 `Node` 可以放置在 `Board` 上, 这时我们称其为 `Managed Slot` 和 `Managed Node`.

此时 `Board` 会尽快将 `Manage Slot` 中的资源提供给合适的 `Managed Node`, 同时也会将 `Managed Node` 的 `output` 取出, 找到合适的 `Slot` 放置这些资源, 若没有合适的 `Slot` 并且有空的 `Tile`, 则生成新的 `Slot`.

## Cycle

即周期, `Board` 两个周期运行, `Node` 由定义确定.

# 未确定概念

## Link & Port(已实现)

`Port` 理解为一个虚拟 `Slot`, 可以关联多个真实 `Slot`. 如果 `Slot` 定义了只接受某种资源, 那么 `Port` 也会表现为只接受已关联的 `Slot` 可以接受的资源

`Link` 可以在 `Port` 之间以一定的效率转移资源. 逻辑大致是:

1. Link 链接了两个 Port, from 和 to.
1. 寻问 from 有无资源, 如果有那么 hold 住 1 个.
1. 寻问 to 有无合适的 Slot, 如果有那么把 hold 住的资源放入对应的 Slot 里.

## Board Node

Board 会自带一个无法移动的 Node, 生产特殊的资源.

## Slot Capacity & Resource Size

即资源是有体积的概念的, `Slot` 的承载量是固定的, 所以承载相同数量的资源时, 大体积的资源需要更多的 `Slot`.

## Node & Board Requirements

即产生 `Node` 和 `Board` 是需要资源的.

## Storage

可以理解为高级 `Slot`, 比如只占 4 个 `Tile`, 但是其内部有 6 个 `Slot`.
