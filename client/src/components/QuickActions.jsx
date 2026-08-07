import { useNavigate } from "react-router-dom";

import "../styles/QuickActions.css";


export default function QuickActions(){


const navigate = useNavigate();



const actions=[


{
icon:"✈️",
title:"AI Destination Recommendation",
description:
"Find destinations tailored to your travel preferences.",
path:"/preferences"
},


{
icon:"🤖",
title:"AI Itinerary Generator",
description:
"Create a personalized travel schedule for your trip.",
path:"/itinerary"
},


{
icon:"🧳",
title:"AI Packing Assistant",
description:
"Prepare a smart packing checklist before your journey.",
path:"/packing"
},


{
icon:"📍",
title:"Atlas",
description:
"Get smart travel help and suggestions from Atlas.",
path:"/atlas"
}


];


return(


<section className="quick-actions">
<h2>
Quick Actions
</h2>




<div className="actions-grid">



{

actions.map((item)=>(


<button

type="button"
className="action-card"

key={item.path}

onClick={()=>
navigate(item.path)
}

aria-label={`Open ${item.title}`}

>



<div className="action-icon">

{item.icon}

</div>




<h3>

{item.title}

</h3>




<p>

{item.description}

</p>




<span>

Open →

</span>



</button>



))

}



</div>




</section>


);


}
