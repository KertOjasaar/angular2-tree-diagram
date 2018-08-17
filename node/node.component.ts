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
  // public childrenTransform;
  constructor(private nodesSrv: NodesListService,  private sanitizer: DomSanitizer){

  }
  @Input() set treeDiagramNode(guid) {
    this.node = this.nodesSrv.getNode(guid);
    console.log('treeDiagramNode:', this.node.displayName);
    try {
      const parent = this.nodesSrv.getNode(this.parentGuidValue);
      const grandParent = this.nodesSrv.getNode(parent.parentId);
      if (grandParent.childrenCount() > 1 && this.nodesSrv.getNode(grandParent.children.values().next().value).children.values().next().value ===
          this.nodesSrv.getNode(Array.from(grandParent.children).pop()).children.values().next().value) {
        // first and last parent of grandParent have same first child
        parent.childrenTransform = this.sanitizer.bypassSecurityTrustStyle('translateY(45px)');
        if (grandParent.children.values().next().value === this.parentGuidValue) {
          // parent is first child of grandparent
          parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translateX(calc(50% + 15px))');
        } else {
          parent.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translateX(calc(-50% - 14px))');
        }
      } else {
        this.node.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
        this.node.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
      }
    } catch (e) {
      this.node.childrenTransform = this.sanitizer.bypassSecurityTrustStyle(`translate(calc(-50% + ${Math.round(this.node.width / 2)}px), 45px)`);
      this.node.manyParentChildrenTransform = this.sanitizer.bypassSecurityTrustStyle('translate(0, 0)');
    }
  }

  getLineToStyle(nrOfParents: number) {
    if (nrOfParents > 1) {
      return this.sanitizer.bypassSecurityTrustStyle('display: block !important');
    }
    return;
  }

}
