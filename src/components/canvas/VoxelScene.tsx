import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WORLDS_DATA } from '../../data/portfolioData';
import { NavigationState } from '../../store/navigationStore';

interface VoxelSceneProps {
  navState: NavigationState;
}

/**
 * VoxelScene - Clean, purposeful 3D spatial environment for subsequent worlds.
 * All unapproved decorative clutter (orbital lines, spline tubes, random particles,
 * decorative octahedrons, rotating rings, obsidian box platforms) has been strictly removed.
 * Provides subtle spatial depth behind the UI without obscuring the background cinematic video.
 */
export const VoxelScene: React.FC<VoxelSceneProps> = ({ navState }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);

  // Compute clean camera target positions for each realm
  const realmCameraPositions = useMemo(() => {
    return [
      new THREE.Vector3(0, 20, 50),   // Realm 0: Universe Overview
      new THREE.Vector3(-60, 18, -20), // Realm 1: Origin Village
      new THREE.Vector3(-30, 25, -50), // Realm 2: Creator's Workshop
      new THREE.Vector3(50, 28, -35),  // Realm 3: Project Kingdom
      new THREE.Vector3(65, 18, 40),   // Realm 4: Trial Grounds
      new THREE.Vector3(25, 40, 75),   // Realm 5: Achievement Realm
      new THREE.Vector3(-45, 38, 60)   // Realm 6: World Builder
    ];
  }, []);

  const realmLookTargets = useMemo(() => {
    return [
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(-60, 10, -50),
      new THREE.Vector3(-30, 20, -80),
      new THREE.Vector3(50, 25, -60),
      new THREE.Vector3(65, 10, 15),
      new THREE.Vector3(25, 35, 55),
      new THREE.Vector3(-45, 30, 40)
    ];
  }, []);

  // Frame loop for camera interpolation without obscuring the video
  const currentLookAt = useRef(new THREE.Vector3(0, 2, 0));

  useFrame((_state, delta) => {
    const targetIdx = navState.targetRealmIndex;
    const targetCamPos = realmCameraPositions[targetIdx] || realmCameraPositions[0];
    const targetLook = realmLookTargets[targetIdx] || realmLookTargets[0];

    // Smooth lerp camera towards target realm
    const lerpSpeed = THREE.MathUtils.clamp(delta * 2.5, 0.02, 0.15);
    camera.position.lerp(targetCamPos, lerpSpeed);
    currentLookAt.current.lerp(targetLook, lerpSpeed);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[40, 60, 40]} intensity={0.8} color="#ffffff" />

      <group ref={groupRef}>
        {/* Subtle, non-obtrusive realm portal markers for the six approved worlds */}
        {WORLDS_DATA.map((w, idx) => {
          const realmNum = idx + 1;
          const isActive = navState.activeRealmIndex === realmNum;

          return (
            <group key={w.id} position={[w.coordinates.x, w.coordinates.y, w.coordinates.z]}>
              {/* Minimal voxel portal frame */}
              <mesh position={[-2, 2.5, 0]}>
                <boxGeometry args={[0.8, 5, 0.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
              </mesh>
              <mesh position={[2, 2.5, 0]}>
                <boxGeometry args={[0.8, 5, 0.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
              </mesh>
              <mesh position={[0, 5.2, 0]}>
                <boxGeometry args={[4.8, 0.8, 0.8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* Soft portal glow disc */}
              <mesh position={[0, 2.5, 0]}>
                <ringGeometry args={[0.2, 1.8, 24]} />
                <meshBasicMaterial
                  color={w.accentColor}
                  side={THREE.DoubleSide}
                  transparent
                  opacity={isActive ? 0.7 : 0.25}
                />
              </mesh>

              {/* Point light for active realm */}
              {isActive && (
                <pointLight color={w.accentColor} intensity={2.0} distance={40} />
              )}
            </group>
          );
        })}
      </group>
    </>
  );
};

export default VoxelScene;
