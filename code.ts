figma.showUI(__html__, { width: 240, height: 100 });

figma.ui.onmessage = async msg => {
  if (msg.type === 'button-clicked') {
    const allImages = await selectAllImagesInSelectedFrames();
    if (allImages.length > 0) {
      for (let imageNode of allImages) {
        if ('fills' in imageNode) {
          const fills = imageNode.fills as ReadonlyArray<Paint>;
          for (const fill of fills) {
            if (fill.type === 'IMAGE' && 'imageHash' in fill && fill.visible !== false) {
              const image = figma.getImageByHash(fill.imageHash!);
              if (image) {
                const imageBytes = await image.getBytesAsync();
                figma.ui.postMessage({
                  type: 'image-data',
                  imageBytes: [...imageBytes],
                  fileName: `${imageNode.name || 'image'}.png`
                });
              }
            }
          }
        }
      }
      figma.ui.postMessage({ type: 'download-complete' });
    } else {
      console.log("No images found in the selected frames.");
      figma.closePlugin("No images found.");
    }
  }
};

async function selectAllImagesInSelectedFrames(): Promise<SceneNode[]> {
  const selectedNodes = figma.currentPage.selection;
  const selectedFrames = selectedNodes.filter(node => node.type === 'FRAME') as FrameNode[];

  if (selectedFrames.length === 0) {
    console.log("No selected frame(s) found.");
    return [];
  }

  let allImages: SceneNode[] = [];
  selectedFrames.forEach(frame => {
    allImages = allImages.concat(findAllImages(frame, []));
  });

  return allImages;
}

function findAllImages(node: SceneNode, images: SceneNode[]): SceneNode[] {
  if ('fills' in node) {
    const fills = node.fills as ReadonlyArray<Paint>;
    for (const fill of fills) {
      if (fill.type === 'IMAGE' && 'imageHash' in fill && fill.visible !== false) {
        images.push(node);
      }
    }
  }

  if ('children' in node) {
    node.children.forEach((child: SceneNode) => {
      findAllImages(child, images);
    });
  }

  return images;
}
