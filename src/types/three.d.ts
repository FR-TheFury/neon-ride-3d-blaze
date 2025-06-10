
import { Object3DNode } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
    group: Object3DNode<THREE.Group, typeof THREE.Group>
    boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>
    planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
    sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
    meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
    ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
    directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
    pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>
  }
}
