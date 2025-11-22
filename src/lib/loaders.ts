import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Creates and configures a GLTFLoader with DRACO support.
 * @returns {GLTFLoader} A configured GLTFLoader instance.
 */
export function createGLTFLoader(): GLTFLoader {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  
  // The decoder path should point to the public directory where the DRACO decoder files are located.
  dracoLoader.setDecoderPath('/draco/');
  
  loader.setDRACOLoader(dracoLoader);
  return loader;
}