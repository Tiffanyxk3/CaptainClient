
   
import k from '../kaboom.js';

export default function InterfaceRequest(reqID, srcObj, destObj, stateName) {
    this.id = reqID;
    this.src = srcObj;
    this.dest = destObj;
    this.state = stateName;
};