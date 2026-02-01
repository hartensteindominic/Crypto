import * as THREE from 'three';
import { ethers } from 'ethers';

const HOUSE_WALLET = "0x13B87B819252A81381C3Ce35e3Bd33199F4c6650";
const ENTRY_FEE = "0.01";
let gameActive = false;
let moveVector = { x: 0, y: 0 };
let player, scene, camera, renderer;

// --- 3D MOBILE OPTIMIZATION ---
function initMobileScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: false, // OFF for better mobile FPS
        powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap resolution
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('game-container').appendChild(renderer.domElement);

    // Simple geometry = High performance
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4 })
    );
    player.position.y = 0.5;
    scene.add(player);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    camera.position.set(0, 5, 10);
    camera.lookAt(player.position);
    
    initJoystick();
    animate();
}

// --- VIRTUAL JOYSTICK (iPhone Controls) ---
function initJoystick() {
    const manager = nipplejs.create({
        zone: document.getElementById('joystick-zone'),
        mode: 'static',
        position: { left: '75px', bottom: '75px' },
        color: 'cyan'
    });

    manager.on('move', (evt, data) => {
        if (!gameActive) return;
        moveVector.x = data.vector.x;
        moveVector.y = data.vector.y;
    });

    manager.on('end', () => {
        moveVector = { x: 0, y: 0 };
    });
}

// --- ETH PAY & DEEP LINK ---
document.getElementById('pay-btn').onclick = async () => {
    if (!window.ethereum) {
        // Deep link to open the site inside MetaMask's mobile browser
        const url = window.location.href.replace(/^https?:\/\//, '');
        window.location.href = `https://metamask.app.link/dapp/${url}`;
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const tx = await signer.sendTransaction({
            to: HOUSE_WALLET,
            value: ethers.parseEther(ENTRY_FEE)
        });

        document.getElementById('status').innerText = "Confirming...";
        await tx.wait();

        document.getElementById('ui-overlay').style.display = 'none';
        gameActive = true;
    } catch (e) {
        alert("Payment Error: " + e.message);
    }
};

function animate() {
    requestAnimationFrame(animate);
    if (gameActive) {
        // Move player based on joystick vector
        player.position.x += moveVector.x * 0.15;
        player.position.z -= moveVector.y * 0.15;
        
        // Follow camera
        camera.position.x = player.position.x;
        camera.position.z = player.position.z + 10;
    }
    renderer.render(scene, camera);
}

initMobileScene();
