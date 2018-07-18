
export class NodeHelper {
  static nodeListFilter(nodes: NodeList, removeByClass: string): HTMLElement[] {
    const filter = function ({ nodeType, className }: HTMLElement) {
      return nodeType !== Node.COMMENT_NODE && className !== removeByClass;
    };

    return Array.prototype.filter.call(nodes, filter);
  }

  static execWithDelay(timeoutId: number, action: () => void, delay?: number): number {
    if (!!timeoutId) {
      clearTimeout(timeoutId);
    }

    return setTimeout(action, delay || 200);
  }
}
