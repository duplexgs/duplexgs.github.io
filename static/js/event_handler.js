document.addEventListener('DOMContentLoaded', domReady);

        function domReady() {
            new Dics({
                container: document.querySelectorAll('.b-dics')[0],
                hideTexts: false,
                textPosition: "bottom"

            });
            new Dics({
                container: document.querySelectorAll('.b-dics')[1],
                hideTexts: false,
                textPosition: "bottom"

            });
        }

        function objectSceneEvent(idx) {
            let dics = document.querySelectorAll('.b-dics')[0]
            let sections = dics.getElementsByClassName('b-dics__section')
            let imagesLength = 4
            for (let i = 0; i < imagesLength; i++) {
                let image = sections[i].getElementsByClassName('b-dics__image-container')[0].getElementsByClassName('b-dics__image')[0]
                switch (idx) {
                    case 0:
                        image.src = './static/images/results/bicycle';
                        break;
                    case 1:
                        image.src = './static/images/results/counter';
                        break;
                    case 2:
                        image.src = './static/images/results/garden';
                        break;
                    case 3:
                        image.src = './static/images/results/room';
                        break;
                    case 4:
                        image.src = './static/images/results/treehill';
                        break;
                    case 5:
                        image.src = './static/images/results/bonsai';
                        break;
                    case 6:
                        image.src = './static/images/results/matrixcity';
                        break;
                }
                switch (i) {
                    case 0:
                        image.src = image.src + '_ours.png';
                        break;
                    case 1:
                        image.src = image.src + '_SFGS.png';
                        break;
                    case 2:
                        image.src = image.src + '_OctreeGS.png';
                        break;
                    case 3:
                        image.src = image.src + '_ScaffoldGS.png';
                        break;

                }
            }

            let scene_list = document.getElementById("object-scale-recon").children;
            for (let i = 0; i < scene_list.length; i++) {
                if (idx == i) {
                    scene_list[i].children[0].className = "nav-link active"
                }
                else {
                    scene_list[i].children[0].className = "nav-link"
                }
            }
        }

        function apartmentSceneEvent(idx) {
            let dics = document.getElementById('apartment-dics');
            if (!dics) return;
            
            let sections = dics.getElementsByClassName('b-dics__section');
            let imagesLength = 4;
            
            for (let i = 0; i < imagesLength; i++) {
                let image = sections[i].getElementsByClassName('b-dics__image-container')[0].getElementsByClassName('b-dics__image')[0];
                switch (idx) {
                    case 0:
                        image.src = './static/images/results/apartment1';
                        break;
                    case 1:
                        image.src = './static/images/results/apartment2';
                        break;
                }
                switch (i) {
                    case 0:
                        image.src = image.src + '_ours.png';
                        break;
                    case 1:
                        image.src = image.src + '_SFGS.png';
                        break;
                    case 2:
                        image.src = image.src + '_OctreeGS.png';
                        break;
                    case 3:
                        image.src = image.src + '_ScaffoldGS.png';
                        break;
                }
            }

            let scene_list = document.getElementById("apartment-scale-recon").children;
            for (let i = 0; i < scene_list.length; i++) {
                if (idx == i) {
                    scene_list[i].children[0].className = "nav-link active";
                } else {
                    scene_list[i].children[0].className = "nav-link";
                }
            }
        }