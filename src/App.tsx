
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

import { useQuery } from 'react-query'

import '@aws-amplify/ui-react/styles.css';
import './App.css'

import awsconfig from './aws-exports';

import { DataStore } from '@aws-amplify/datastore';
import { Theme, Vote } from './models';
import { useEffect, useState } from 'react';

Amplify.configure(awsconfig);
type ThemeWithVote = Theme & {vote?: Vote, voteCount?: number};

function App({ signOut, user }:{signOut?:any, user?:any}) {


  const [themes, setThemes] = useState<Theme[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [themesWithVote, setThemesWithVote] = useState<ThemeWithVote[]>([])

  const { isLoading: themesLoading, error: themesError } = useQuery<any, QueryError, Theme[]>("themes", () =>{
    console.log("user", user)
    const models = DataStore.query(Theme);
    return models;
  }, {onSuccess: setThemes})

  const { isLoading: votesLoading, error: votesError } = useQuery<any, QueryError, Vote[]>("votes", async () =>{
    const models = await DataStore.query(Vote);
    console.log(models)
    return models;
  }, {onSuccess: setVotes})

  

  useEffect(() => {
    const mergeThemesWithVote = themes.map( t => {
      const vote = votes.find(v => v.themeID === t.id)
      return {...t, vote: vote}
    })

    setThemesWithVote(mergeThemesWithVote)
  }, [themes, votes])


  if(themesLoading || themesError){
    return <div>chargement des thèmes...</div>
  }
  if(votesLoading || votesError){
    return <div>chargement de vos votes...</div>
  }

  const voteFor = (theme: ThemeWithVote, value:number) => async () => {
    
    let newVote: Vote;
    if(theme.vote){
      newVote = await DataStore.save(
        Vote.copyOf(theme.vote, updated => {
          updated.value = value
        })
      );
    }else{
      const ballot = { 
        "value": value,
        "themeID": theme.id,
      }
      newVote = await DataStore.save(
        new Vote(ballot)
      );
    }
    
    const newThemesWithVote = themesWithVote.map( t => {
      if(t === theme){
        return {...t, vote: newVote}
      }else{
        return t;
      }
    })
    setThemesWithVote(newThemesWithVote)
    
  }

  const revealVoteCount = (theme: ThemeWithVote) => async () => {

    const actualTheme = themes.find(t => t.id === theme.id)
    const votes =  await actualTheme!.Votes
    console.log(votes)
    console.log(theme)
    const voteCount = await votes.toArray().then(vs => vs.length)
    
    const newThemesWithVote = themesWithVote.map( t => {
      if(t === theme){
        return {...t, voteCount: voteCount}
      }else{
        return t;
      }
    })
    setThemesWithVote(newThemesWithVote)
  }

  return (
    <>
      <p style={{"fontSize": "2em"}}>Vote pour le thème du Concours de fiction interactive francophone 2024</p>
      <p>Bonjour {user.attributes.preferred_username} <button onClick={signOut}>Sign out</button></p>
      
      <p>

      </p>

      <div>
        <table style={{"maxWidth": "450px", "margin": "0 auto"}}>
          <thead>
            <tr>
              <td><strong>Thème</strong></td>
              <td><strong>Votre vote</strong></td>
              <td><strong>Total</strong></td>
            </tr>
          </thead>
          <tbody>
            {themesWithVote.map(( t ) => {
              return <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <button className={t.vote?.value === -1 ? "selected" : ""} onClick={voteFor(t, -1)}>-1</button>
                    <button className={t.vote?.value === 0 ? "selected" : ""} onClick={voteFor(t, 0)}>0</button>
                    <button className={t.vote?.value === +1 ? "selected" : ""} onClick={voteFor(t, +1)}>+1</button>
                  </td>
                  <td>
                    {t.voteCount !== undefined ? t.voteCount : <button onClick={revealVoteCount(t)}>reveal</button>}
                  </td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default withAuthenticator(App)
