import { TreeDiagramNode } from './node.class';
import { TreeDiagramNodeMaker } from "./node-maker.class";
export class TreeDiagramNodesList {
  private _nodesList = new Map();
  public roots: TreeDiagramNode[];
  public makerGuid: string;
  public draggingNodeGuid;
  private _nodeTemplate = {
    displayName: 'New node',
    children: [],
    guid: '',
    parentId: null
  };

  private uuidv4 () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  constructor (_nodes: any[], private config) {
    _nodes.forEach(_node => {
      this._nodesList.set(_node.guid, new TreeDiagramNode(_node, config, this.getThisNodeList.bind(this)));
    });
    this._makeRoots();

    this.makerGuid = this.uuidv4();
    let node = {
      guid: this.makerGuid,
      parentId: 'root',
      children: [],
      displayName: 'New node'
    };
    let maker = new TreeDiagramNodeMaker(node, this.config, this.getThisNodeList.bind(this));
    this._nodesList.set(this.makerGuid, maker);
  }

  private _makeRoots () {
    this.roots = Array.from(this.values()).filter((node: TreeDiagramNode) => node.isRoot());
  }

  public values () {
    return this._nodesList.values();
  }

  public getNode (guid: string): TreeDiagramNode {
    return this._nodesList.get(guid);
  }

  public rootNode(guid: string) {
    let node = this.getNode(guid);
    node.isDragging = false;
    node.isDragover = false;
    if (node.parentId){
      let parent = this.getNode(node.parentId);
      parent.children.delete(guid);
    }
    node.parentId = null;
    this._makeRoots();
    let maker = this.getNode(this.makerGuid);
    maker.isDragging = false;
    maker.isDragover = false;
  }

  public transfer (origin: string, target: string ) {
    let _origin = this.getNode(origin);
    let _target = this.getNode(target);
    _origin.isDragover = false;
    _origin.isDragging = false;
    _target.isDragover = false;
    if (_origin.parentId === target || origin === target) {
      return;
    }
    let remakeRoots = _origin.isRoot();
    if (_origin.parentId) {
      let _parent = this.getNode(_origin.parentId);
      _parent.children.delete(origin);
      if (!_parent.hasChildren()) {
        _parent.toggle(false);
      }
    }
    if (this.getNode(origin).childrenCount() === 1) {
      _target.children.forEach(child => {
        // console.log('child:', child);
        this.getNode(child).children.add(this.getNode(origin).children.values().next().value);
        this.getNode(this.getNode(origin).children.values().next().value).allParentIds.push(child);
        // console.log('tree:', this._nodesList);
      });
      if (this.getNode(this.getNode(origin).children.values().next().value).allParentIds.length > 0) {
        this.getNode(this.getNode(origin).children.values().next().value).allParentIds.push(
            this.getNode(this.getNode(origin).children.values().next().value).parentId
        );
      }
    }
    _target.children.add(origin);
    // console.log('target name:', _target.displayName);

    _origin.parentId = target;
    remakeRoots && this._makeRoots();

    this.serialize();
    // console.log('transfer target:', _target);
  }

  public getThisNodeList () {
    return this;
  }

  public toggleSiblings (guid: string) {
    let target = this.getNode(guid);
    // console.log('target:', target);
    if (target && target.parentId) {
      let parent = this.getNode(target.parentId);
      let toggleState = false;
      // console.log('parent:', parent);
      if (parent.childrenCount() > 1 &&
          this.getNode(this.getNode(parent.children.values().next().value).children.values().next().value) ===
          this.getNode(this.getNode(Array.from(parent.children).pop()).children.values().next().value)) {
        toggleState = target.isExpanded;
      }
      parent.children.forEach((nodeGuid) => {
        if (nodeGuid === guid) {
          return;
        }

        this.getNode(nodeGuid).toggle(toggleState, false);
      });
    } else {
      /*for (let root of this.roots) {
        if (root.guid === guid) {
          continue;
        }
        root.toggle(false)
      }*/
      console.log('nodesList.class.ts toggleSiblings trying to toggle false every root node');
    }
  }

  public serialize () {
    let out = []
    this._nodesList.forEach((node: TreeDiagramNode) => {
      let json: any = {
        guid: node.guid,
        displayName: node.displayName,
        parentId: node.parentId,
        // allParentIds: node.allParentIds
      };
      json.children = Array.from(node.children);

      out.push(json);
    })
    return out;
  }

  public destroy (guid: string) {
    // TODO: Mõtle kogu see funktsioon uuesti läbi
    let target = this.getNode(guid);
    console.log('destroy target:', target);
    let parent = this.getNode(target.parentId);
    console.log('destroy parent:', parent);
    if (target.parentId) {
      parent.children.delete(guid);
      if (parent.parentId) {
        const grandParent = this.getNode(parent.parentId);
        grandParent.children.forEach(targetGrandParentChild => {
          if (targetGrandParentChild !== target.parentId) {
            this.getNode(targetGrandParentChild).children.delete(guid);
          }
        });
      }
    }
    if (target.hasChildren()) {
      target.children.forEach((child: string) => {
        let theNode = this.getNode(child);
        theNode.parentId = target.parentId;
        parent.children.add(theNode.guid);
        theNode.allParentIds = target.allParentIds;
        if (theNode.allParentIds.length > 1) {
          theNode.allParentIds.forEach(parentId => {
            this.getNode(parentId).children.add(child);
          });
          // theNode.allParentIds.splice(theNode.allParentIds.indexOf(guid));
          /*if (target.parentId) {
            const grandParent = this.getNode(target.parentId);
            grandParent.children.forEach(targetGrandParentChild => {
              if (targetGrandParentChild !== target.parentId) {
                this.getNode(targetGrandParentChild).children.delete(child);
              }
            });
          }*/
        // } else {
        //   theNode.parentId = target.parentId;
        //   parent.children.add(theNode.guid);
          /*if (parent.parentId) {
            const grandParent = this.getNode(parent.parentId);
            grandParent.children.forEach(targetGrandParentChild => {
              if (targetGrandParentChild !== target.parentId) {
                this.getNode(targetGrandParentChild).children.add(guid);
              }
            });
          }*/
        }
      });
    }
    this._nodesList.delete(guid);
    this._makeRoots();
    // console.warn(this.values());
    console.log('tree:', this._nodesList.values());
  }

  public newNode(parentId = null) {
    let _nodeTemplate = Object.assign({}, this._nodeTemplate);
    _nodeTemplate.guid = this.uuidv4();
    _nodeTemplate.parentId = parentId;
    this._nodesList.set(_nodeTemplate.guid, new TreeDiagramNode(_nodeTemplate, this.config, this.getThisNodeList.bind(this)));
    this._makeRoots();
    return _nodeTemplate.guid;
  }

}