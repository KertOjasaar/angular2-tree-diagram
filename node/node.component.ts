import {
  Component,
  Input
} from '@angular/core';

import { NodesListService } from '../services/nodesList.service'
import { TreeDiagramNode } from "../classes/node.class"
import { DomSanitizer } from "@angular/platform-browser"
import { TreeDiagramNodeMaker } from "../classes/node-maker.class"

@Component({
  selector: '[treeDiagramNode]',
  styleUrls: [ './node.component.scss' ],
  templateUrl: './node.component.html',
})
export class Node {
  public node: TreeDiagramNode | TreeDiagramNodeMaker;
  private parentGuidValue: string;
  @Input() set parentGuid(guid) {
    this.parentGuidValue = guid;
  }
  constructor(private nodesSrv: NodesListService,  private sanitizer: DomSanitizer){

  }
  @Input() set treeDiagramNode(guid) {
    this.node = this.nodesSrv.getNode(guid);
    const parent = this.nodesSrv.getNode(this.parentGuidValue);
    try {
      const grandParent = this.nodesSrv.getNode(parent.parentId);
      const valueOfPosition = this.getIndexOfNode(this.parentGuidValue, grandParent);

      if (grandParent.childrenCount() > 1 && this.nodesSrv.getNode(grandParent.children.values().next().value).children.values().next().value ===
          this.nodesSrv.getNode(Array.from(grandParent.children).pop()).children.values().next().value) {
        // first and last parent of grandParent have same first child
        parent.childrenTransform = this.sanitizer.bypassSecurityTrustStyle('translateY(45px)');

        if (grandParent.childrenCount() % 2 === 0) {
          parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(calc(${valueOfPosition * 50}% + ${valueOfPosition * 15}px))`);
        } else {
          // odd number of children
          if (valueOfPosition === grandParent.childrenCount() / 2) {
            // item is in the middle and should get translateX(0)
            parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translateX(0)');
          } else {
            // item in first or second half
            parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(calc(${valueOfPosition * 50}% + ${valueOfPosition * 15}px))`);
          }
        }

      } else {
        if (this.node.isNew) {
          parent.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
          parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
        } else {
          this.node.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
          this.node.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
        }
      }
    } catch (e) {
      if (this.node.isNew) {
        parent.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
        parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
      } else {
        this.node.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
        this.node.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
      }
    }
  }

  getIndexOfNode(guid, parent) {
    let result = -1;
    let i = (Math.ceil(parent.childrenCount() / 2) - 1) * 2;
    if (parent.childrenCount() % 2 === 0) {
      // change starting value if even number of children
      i = parent.childrenCount() - 1;
    }
    parent.children.forEach(child => {
      if (child === guid) {
        result = i;
      }
      i -= 2;
    });

    return result;
  }

  // getLineWidthAndLeft(parentIds: Array<string>): any {
  getLineWidthAndLeft(nrOfParents: number): any {
    return this.sanitizer.bypassSecurityTrustStyle(
        `width: ${(this.node.width + 30) * (nrOfParents - 1)}px;
        left: -${nrOfParents === 2 ? 15 : ((this.node.width / 2 + (nrOfParents % 2 === 0 ? 15 : 30)) * Math.floor(nrOfParents / 2)) + (nrOfParents % 2 === 0 ? 15 : 0)}px`
    );
  }

}
