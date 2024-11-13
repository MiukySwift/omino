// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage =  async(msg: {type: string, count: number}) => {
  await figma.loadAllPagesAsync();
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });

  const myCollection:CollectionType = {
    name: 'NewCollection',
    mode: [{
      modeName:'Light',
      variables: [
        {
        name: 'Tint/primary',
        type: 'COLOR',
        value: { r: 86/255, g: 152/255, b: 209/255 },
        },
        {
        name: 'Tint/secondary',
        type: 'COLOR',
        value: { r: 54/255, g: 184/255, b: 143/255 },
        },
        {
        name: 'Tint/Tertiary',
        type: 'COLOR',
        value: { r: 238/255, g: 122/255, b: 80/255 },
        },
      ]
    },
    {
      modeName:'Dark',
      variables: [
        {
        name: 'Tint/primary',
        type: 'COLOR',
        value: { r: 86/255, g: 152/255, b: 209/255 },
        },
        {
        name: 'Tint/secondary',
        type: 'COLOR',
        value: { r: 54/255, g: 184/255, b: 143/255 },
        },
        {
        name: 'Tint/Tertiary',
        type: 'COLOR',
        value: { r: 238/255, g: 122/255, b: 80/255 },
        },
      ]
    }]
  }

  //创建variable styles
  createNewCollection(myCollection);




  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-shapes') {
    // This plugin creates rectangles on the screen.
    const numberOfRectangles = msg.count;

    const nodes: SceneNode[] = [];
    for (let i = 0; i < numberOfRectangles; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};

////定义variable类型的预设styles表

type VariableType = {
  name: string,
  type: 'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING',
  value: Readonly<VariableValue>,
}
type CollectionType = {
  name: string,
  mode: ModeType[]
}
type ModeType = {
    modeName:string,
    variables:VariableType[],
  }

  
//Function:创建一个Collection，支持多模式同时建立
function createNewCollection(newCollection:CollectionType){
  const collection:CollectionType = newCollection;
  if(collection){
    //创建一个新的样式集合
    const createCollection = figma.variables.createVariableCollection(collection.name);
    //创建一个新的Mode在刚建立的集合中
    collection.mode.forEach((amode:ModeType,index:number) =>{
      const newMode = createCollection.addMode(amode.modeName);
      amode.variables.forEach((variable:VariableType) =>{

        let newVariable;
        let newVariablesId: string[] = [];   //获得一个新建的Collection Name的ID数组

        if(index === 0){
        //创建一个新的变量，并声明其类型：（'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'）
         newVariable = figma.variables.createVariable(variable.name,createCollection,variable.type);
         //设置新变量的值，与前一行声明类型保持一致（'BOOLEAN' | 'COLOR' | 'FLOAT' | 'STRING'）
         newVariable.setValueForMode(newMode,variable.value);
         newVariablesId.push(newVariable.id);
        }else{
          if(newVariablesId){
            newVariablesId.forEach(id=>{
              newVariable = figma.variables.getVariableById(id);
              if(newVariable){
              newVariable.setValueForMode(newMode,variable.value);
            }
            })
          
          }
        }
      });
    });

    //创建时，会出现默认的一个Mode1，将它删除
    createCollection.removeMode(createCollection.defaultModeId);

  }else{
    console.error('have some errors~');
  }
}
