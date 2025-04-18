const sampleListings = [
    {
        title: "Cozy Beachfront Cottage",
        description:
            "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1500,
        location: "Goa",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [73.8333, 15.3333], // Goa coordinates
        },
    },
    {
        title: "Modern Loft in Downtown",
        description:
            "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1200,
        location: "Mumbai, Maharashtra",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [72.8777, 19.0760], // Mumbai coordinates
        },
    },
    {
        title: "Mountain Retreat",
        description:
            "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 1000,
        location: "Manali, Himachal Pradesh",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.1888, 32.2432], // Manali coordinates
        },
    },
    {
        title: "Historic Villa",
        description:
            "Experience the charm of history in this beautifully restored villa. Explore the rich heritage.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 2500,
        location: "Jaipur, Rajasthan",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [75.7884, 26.9139], // Jaipur coordinates
        },
    },
    {
        title: "Secluded Treehouse Getaway",
        description:
            "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 800,
        location: "Munnar, Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.0597, 10.0882], // Munnar coordinates
        },
    },
    {
        title: "Beachfront Paradise",
        description:
            "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 2000,
        location: "Andaman & Nicobar Islands",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [92.7304, 11.7401], // Andaman & Nicobar coordinates (approximate center)
        },
    },
    {
        title: "Rustic Cabin by the Lake",
        description:
            "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 900,
        location: "Nainital, Uttarakhand",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [79.4601, 29.3833], // Nainital coordinates
        },
    },
    {
        title: "Luxury Penthouse with City Views",
        description:
            "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
        image: {
            filename: "listingimage",
            url: "https://plus.unsplash.com/premium_photo-1670963964797-942df1804579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 3500,
        location: "Bengaluru, Karnataka",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.5946, 12.9716], // Bengaluru coordinates
        },
    },
    {
        title: "Ski Chalet",
        description:
            "Hit the slopes right from your doorstep in this ski chalet.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 3000,
        location: "Gulmarg, Jammu and Kashmir",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [74.3997, 34.0500], // Gulmarg coordinates
        },
    },
    {
        title: "Wildlife Safari Lodge",
        description:
            "Experience the thrill of the wild in a comfortable safari lodge. Witness the wildlife up close.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 4000,
        location: "Ranthambore National Park, Rajasthan",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.5039, 26.0147], // Ranthambore coordinates
        },
    },
    {
        title: "Historic House on Backwaters",
        description:
            "Stay in a piece of history in this beautifully preserved house on the iconic backwaters.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1800,
        location: "Alleppey (Alappuzha), Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.3388, 9.4981], // Alleppey coordinates
        },
    },
    {
        title: "Private Island Retreat",
        description:
            "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 10000,
        location: "Lakshadweep Islands",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [73.0833, 10.5667], // Lakshadweep coordinates (approximate center)
        },
    },
    {
        title: "Charming Cottage in the Hills",
        description:
            "Escape to the picturesque hills in this quaint and charming cottage.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmVhY2glMjB2YWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1200,
        location: "Coorg, Karnataka",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [75.7054, 12.5274], // Coorg coordinates
        },
    },
    {
        title: "Historic Building in the City",
        description:
            "Step back in time in this elegant historic building located in the heart of the city.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1533619239233-6280475a633a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 2200,
        location: "Kolkata, West Bengal",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [88.3639, 22.5726], // Kolkata coordinates
        },
    },
    {
        title: "Beachfront Bungalow",
        description:
            "Relax on the sandy shores in this beautiful beachfront bungalow with a private pool.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1602391833977-358a52198938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1800,
        location: "Kerala", // Broad location, can be more specific if needed
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.2711, 10.8505], // Kerala coordinates (approximate center)
        },
    },
    {
        title: "Mountain View Cabin",
        description:
            "Enjoy breathtaking mountain views from this cozy cabin in the scenic mountains.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 1500,
        location: "Darjeeling, West Bengal",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [88.2640, 27.0409], // Darjeeling coordinates
        },
    },
    {
        title: "Art Deco Apartment",
        description:
            "Step into the glamour of the 1920s in this stylish Art Deco apartment.",
        image: {
            filename: "listingimage",
            url: "https://plus.unsplash.com/premium_photo-1670963964797-942df1804579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 1600,
        location: "Chennai, Tamil Nadu",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [80.2707, 13.0827], // Chennai coordinates
        },
    },
    {
        title: "Tropical Villa with Pool",
        description:
            "Escape to a tropical paradise in this luxurious villa with a private infinity pool.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 3000,
        location: "Kovalam, Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.9850, 8.3930], // Kovalam coordinates
        },
    },
    {
        title: "Historic Palace",
        description:
            "Live like royalty in this historic palace. Explore the rich heritage of the area.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJlYWNoJTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 4000,
        location: "Udaipur, Rajasthan",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [73.7125, 24.5854], // Udaipur coordinates
        },
    },
    {
        title: "Desert Camp with Pool",
        description:
            "Experience luxury in the middle of the desert in this opulent camp with a private pool.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHViYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 5000,
        location: "Jaisalmer, Rajasthan",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [79.2941, 20.2672], // Approximate center for Jaisalmer region
        },
    },
    {
        title: "Rustic Log Cabin",
        description:
            "Unplug and unwind in this cozy log cabin surrounded by natural beauty.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 1100,
        location: "Shimla, Himachal Pradesh",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.1734, 31.1048], // Shimla coordinates
        },
    },
    {
        title: "Beachfront Villa",
        description:
            "Enjoy the crystal-clear waters in this beautiful beachfront villa.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 2500,
        location: "Pondicherry",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [79.8300, 11.9414], // Pondicherry coordinates
        },
    },
    {
        title: "Eco-Friendly Treehouse",
        description:
            "Stay in an eco-friendly treehouse nestled in the forest. It's the perfect escape for nature lovers.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 750,
        location: "Thekkady, Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.1698, 9.6034], // Thekkady coordinates
        },
    },
    {
        title: "Historic Cottage",
        description:
            "Experience the charm of history in this beautifully restored cottage with a private garden.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 1600,
        location: "Fort Kochi, Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.2433, 9.9633], // Fort Kochi coordinates
        },
    },
    {
        title: "Modern Apartment",
        description:
            "Explore the vibrant city from this modern and centrally located apartment.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
        },
        price: 2000,
        location: "Delhi",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [77.1025, 28.7041], // Delhi coordinates
        },
    },
    {
        title: "Lakefront Cabin",
        description:
            "Spend your days by the lake in this cozy cabin in the scenic hills.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1200,
        location: "Ooty, Tamil Nadu",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.6956, 11.3917], // Ooty coordinates
        },
    },
    {
        title: "Luxury Villa",
        description:
            "Indulge in luxury in this overwater villa with stunning views of the ocean.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 6000,
        location: "Havelock Island, Andaman and Nicobar Islands",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [92.9622, 11.9734], // Havelock Island coordinates
        },
    },
    {
        title: "Ski Chalet",
        description:
            "Hit the slopes in style with this luxurious ski chalet.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxha2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 4000,
        location: "Auli, Uttarakhand",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [79.5669, 30.5204], // Auli coordinates
        },
    },
    {
        title: "Secluded Beach House",
        description:
            "Escape to a secluded beach house on the coast. Surf, relax, and unwind.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
        },
        price: 1800,
        location: "Varkala, Kerala",
        country: "India",
        geometry: {
            type: "Point",
            coordinates: [76.7108, 8.7342], // Varkala coordinates
        },
    },
    {
        title: "Luxury Villa with Infinity Pool",
        description: "Experience ultimate luxury in this stunning villa featuring a spectacular infinity pool overlooking the Arabian Sea. This 4-bedroom retreat offers modern amenities including a fully equipped kitchen, home theater, private gym, and a rooftop terrace perfect for sunset views. The master suite includes a private balcony and spa-like bathroom.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 25000,
        location: "North Goa",
        country: "India",
        category: "beach",
        geometry: {
            type: "Point",
            coordinates: [73.8223, 15.4989]
        }
    },
    {
        title: "Mountain View Eco Resort",
        description: "Immerse yourself in nature at this sustainable eco-resort nestled in the Himalayas. The glass-walled villa offers panoramic mountain views, a private hot tub, and a meditation deck. Features include solar power, organic garden, and locally crafted furniture. Perfect for those seeking a luxurious yet environmentally conscious retreat.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 18000,
        location: "Shimla",
        country: "India",
        category: "mountain",
        geometry: {
            type: "Point",
            coordinates: [77.1734, 31.1048]
        }
    },
    {
        title: "Urban Penthouse Suite",
        description: "Live in the lap of luxury in this ultra-modern penthouse located in the heart of Mumbai. This 3000 sq ft space features floor-to-ceiling windows, designer furniture, smart home automation, and a private terrace with a jacuzzi. Enjoy access to premium amenities including a concierge service, infinity pool, and sky lounge.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 35000,
        location: "Mumbai",
        country: "India",
        category: "city",
        geometry: {
            type: "Point",
            coordinates: [72.8777, 19.0760]
        }
    },
    {
        title: "Lakeside Luxury Cottage",
        description: "Escape to this charming cottage situated on the shores of Lake Pichola. The property features traditional Rajasthani architecture with modern amenities, including a private dock, outdoor dining area, and kayaking equipment. Perfect for romantic getaways or family vacations with direct lake access and stunning sunset views.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 15000,
        location: "Udaipur",
        country: "India",
        category: "lake",
        geometry: {
            type: "Point",
            coordinates: [73.7125, 24.5854]
        }
    },
    {
        title: "Heritage Haveli with Modern Twist",
        description: "Experience the perfect blend of traditional and contemporary in this restored haveli. Features include hand-painted frescoes, crystal chandeliers, and modern amenities like a temperature-controlled pool, spa, and home theater. Each room is uniquely designed with antique furniture and modern art pieces.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 28000,
        location: "Jaipur",
        country: "India",
        category: "trending",
        geometry: {
            type: "Point",
            coordinates: [75.7873, 26.9124]
        }
    },
    {
        title: "Countryside Wellness Retreat",
        description: "Find peace in this luxury wellness retreat set amidst 5 acres of organic farms. The villa features a yoga studio, meditation gardens, infinity pool, and ayurvedic spa. Enjoy farm-to-table dining, cooking classes, and wellness workshops. Perfect for those seeking a rejuvenating escape.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
        },
        price: 20000,
        location: "Coorg",
        country: "India",
        category: "countryside",
        geometry: {
            type: "Point",
            coordinates: [75.7367, 12.4244]
        }
    }
];

module.exports = { data: sampleListings };
  
