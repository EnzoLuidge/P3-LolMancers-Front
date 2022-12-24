import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as config from '../../config.js'
import Navbar from '../../components/Navbar/navbar';
import Spinner from 'react-bootstrap/Spinner';

export default function Maestria(props){
    const [maestria,setMaestria]=useState([]);
    const [score, setScore] = useState(null);
    const [isLoading,setIsLoading]=useState(true);
  
    function getSummonerId(name){
        const linkSummonerId = "https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/"+name+"?api_key="+config.API_KEY;
        return axios.get(linkSummonerId).then(function(response){
            console.log(response.data.id);
            return response.data.id
            }).catch(function(error){
            console.log(error);
        });
    }
  
    async function getMastery(name){
        maestria.splice(0,maestria.length);
        const summonerId = await getSummonerId(name); 
        const linkMastery = "https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/"+summonerId+"?api_key="+config.API_KEY;

        const mastery = await axios.get(linkMastery)
            .then(function(response){
                // console.log(response.data)
                return response.data})
            .catch(function(erro){
                console.log(erro)})
  
        for (let i=0; i<10; i++){
            const championId = mastery[i].championId;
            const championPoints = mastery[i].championPoints;
            const linkChampion = "http://ddragon.leagueoflegends.com/cdn/11.6.1/data/pt_BR/champion.json";
            await axios.get(linkChampion)
                .then(function(champion){
                    const championName = Object.keys(champion.data.data).find(key => champion.data.data[key].key == championId);
                    const championImage = champion.data.data[championName].image.full;
                    maestria.push({name:championName,points:championPoints,image:championImage});
                })    
                .catch(function(erro){  
                    console.log(erro);})
        }

        setIsLoading(false);    
    }  
        
    async function getChampionScores(name){
        const summonerId = await getSummonerId(name); 
        const linkChampionScores = "https://br1.api.riotgames.com/lol/champion-mastery/v4/scores/by-summoner/"+summonerId+"?api_key="+config.API_KEY;
        console.log(linkChampionScores);
        const championScores = await axios.get(linkChampionScores)
            .then(function(response){
                console.log(response.data)
                return response.data})
            .catch(function(erro){
                console.log(erro)})
        setScore(championScores);
    }

    useEffect(() => {
        getMastery(props.name);
        getChampionScores(props.name);
    }, []);

    const championsMasteryContainer = (<>
        {maestria.map((champion, index) => 
            <div className="maestria-champion" key={index}>
                <img className="maestria-champion-image" src={"http://ddragon.leagueoflegends.com/cdn/11.6.1/img/champion/"+champion.image} alt={champion.name}/>
                <div className="maestria-champion-info">
                    <h3>{champion.name}</h3>
                    <p>{champion.points} pontos</p>
                </div>
            </div>
        )}
    </>)

    const spinnerContainer = (<>
        <Spinner animation="border" role="status" style={{ width: "2rem", height: "2rem" }}>
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </>)

    return(
        <div className="maestria">  
            <Navbar />
            <div className="maestria-container">
                <h2 className="maestria-title">Maestria de {props.name}</h2> 
                <p class="maestria-score">Nível total de maestria: {score}</p>
                <div className="maestria-content">
                    {isLoading ? spinnerContainer : championsMasteryContainer}
                </div>  
            </div>
        </div>
    )
}