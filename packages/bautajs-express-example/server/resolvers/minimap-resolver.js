import { pipe, step, resolver, iif, parallel } from '@axa/bautajs-core';
import { getResponse, getRequest } from '@axa/bautajs-express';

const MAP = {};

function setStatusCode(statusCode) {
  return step((prev, ctx) => {
    getResponse(ctx).status(statusCode);

    return prev;
  });
}

function getAllMinimapStep() {
  return MAP;
}

function getKeyFromRequestStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { key } = req.params;

  return key;
}

function getKeyFromBodyStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { key } = req.body;

  return key;
}

function searchMinimapByKeyStep([inputMinimap, inputKey]) {
  if (inputKey in inputMinimap) {
    return { [inputKey]: inputMinimap[inputKey] };
  }
  return null;
}

function createMinimapStep(_prev, ctx) {
  const req = getRequest(ctx);

  const { key, value } = req.body;

  MAP[key] = value;
}

const getAllMinimapPipeline = pipe(getAllMinimapStep);

const getMinimapByKeyPipeline = pipe(
  parallel(getAllMinimapStep, getKeyFromRequestStep),
  searchMinimapByKeyStep,
  iif(
    found => !!found,
    found => found,
    setStatusCode(404)
  )
);

const createMinimapPipeline = pipe(
  parallel(getAllMinimapStep, getKeyFromBodyStep),
  searchMinimapByKeyStep,
  iif(found => !found, createMinimapStep, setStatusCode(409))
);

export default resolver(operations => {
  operations.getAllMinimap.setup(getAllMinimapPipeline);
  operations.getMinimapByKey.setup(getMinimapByKeyPipeline);
  operations.createMinimap.setup(createMinimapPipeline);
});
