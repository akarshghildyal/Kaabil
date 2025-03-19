// @ts-nocheck
"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export function BranchManagerAvatar({ mouthOpen }) {
  const { nodes, materials } = useGLTF("/3d/67d9382ff188f383380ff398.glb");
  const headRef = useRef();

  useEffect(() => {
    if (headRef.current) {
      console.log(
        "Morph Target Dictionary:",
        headRef.current.morphTargetDictionary
      );
      console.log(
        "Morph Target Influences:",
        headRef.current.morphTargetInfluences
      );
    }
  }, []);

  useEffect(() => {
    if (headRef.current && headRef.current.morphTargetDictionary) {
      const jawOpenIndex = headRef.current.morphTargetDictionary["jawOpen"];
      if (jawOpenIndex !== undefined) {
        headRef.current.morphTargetInfluences[jawOpenIndex] = mouthOpen ? 1 : 0;
        console.log(
          `Jaw Open Index: ${jawOpenIndex}, Influence: ${headRef.current.morphTargetInfluences[jawOpenIndex]}`
        );
      } else {
        console.error('Morph target "jawOpen" not found in the dictionary.');
      }
    }
  }, [mouthOpen]);

  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 25 }}>
      <ambientLight intensity={3} />
      <pointLight position={[10, 10, 10]} />

      <group position={[0, -2.3, 0]} scale={[1.4, 1.4, 1.4]}>
        <group dispose={null}>
          <primitive object={nodes.Hips} />
          <skinnedMesh
            name="EyeLeft"
            geometry={nodes.EyeLeft.geometry}
            material={materials.Wolf3D_Eye}
            skeleton={nodes.EyeLeft.skeleton}
            morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
          />
          <skinnedMesh
            name="EyeRight"
            geometry={nodes.EyeRight.geometry}
            material={materials.Wolf3D_Eye}
            skeleton={nodes.EyeRight.skeleton}
            morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
            morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
          />
          <skinnedMesh
            ref={headRef}
            name="Wolf3D_Head"
            geometry={nodes.Wolf3D_Head.geometry}
            material={materials.Wolf3D_Skin}
            skeleton={nodes.Wolf3D_Head.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
          />
          <skinnedMesh
            name="Wolf3D_Teeth"
            geometry={nodes.Wolf3D_Teeth.geometry}
            material={materials.Wolf3D_Teeth}
            skeleton={nodes.Wolf3D_Teeth.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
          />
          <skinnedMesh
            name="Wolf3D_Beard"
            geometry={nodes.Wolf3D_Beard.geometry}
            material={materials.Wolf3D_Beard}
            skeleton={nodes.Wolf3D_Beard.skeleton}
            morphTargetDictionary={nodes.Wolf3D_Beard.morphTargetDictionary}
            morphTargetInfluences={nodes.Wolf3D_Beard.morphTargetInfluences}
          />
          <skinnedMesh
            geometry={nodes.Wolf3D_Glasses.geometry}
            material={materials.Wolf3D_Glasses}
            skeleton={nodes.Wolf3D_Glasses.skeleton}
          />
          <skinnedMesh
            geometry={nodes.Wolf3D_Body.geometry}
            material={materials.Wolf3D_Body}
            skeleton={nodes.Wolf3D_Body.skeleton}
          />
          <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
            material={materials.Wolf3D_Outfit_Bottom}
            skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
          />
          <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
            material={materials.Wolf3D_Outfit_Footwear}
            skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
          />
          <skinnedMesh
            geometry={nodes.Wolf3D_Outfit_Top.geometry}
            material={materials.Wolf3D_Outfit_Top}
            skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
          />
        </group>
      </group>
    </Canvas>
  );
}

useGLTF.preload("/3d/67d9382ff188f383380ff398.glb");
